import { evaluateExpression, interpolateTemplate } from '../expression/expression-parser';
import type { ExpressionContext } from '../expression/expression-types';
import type { Dataset, DatasourceFetchContext, DatasourcePlugin } from '../report-builder-types';
import type { DatasourceConfig } from '../report-definition-types';
import { withCorePlugins } from './core-plugins';

export interface InheritedDatasets {
    configs: DatasourceConfig[];
    datasets: Record<string, Dataset>;
}

export interface ResolveDatasourcesOptions {
    configs: DatasourceConfig[];
    plugins: DatasourcePlugin[];
    parameters: Record<string, unknown>;
    builtInFields: Record<string, unknown>;
    inherited?: InheritedDatasets;
    signal: AbortSignal;
    onDatasetResolved?: (config: DatasourceConfig, dataset: Dataset) => void;
}

export interface ResolveDatasourcesResult {
    datasets: Record<string, Dataset>;
    errors: Map<string, string>;
}

function toRowsMap(datasets: Record<string, Dataset>): Record<string, Record<string, unknown>[]> {
    const out: Record<string, Record<string, unknown>[]> = {};
    for (const [name, ds] of Object.entries(datasets)) out[name] = ds.rows;
    return out;
}

function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}

/** The datasources with the given ids together with every datasource they are derived from, in their original order. */
export function withDatasourceDependencies(configs: DatasourceConfig[], ids: string[], plugins: DatasourcePlugin[]): DatasourceConfig[] {
    const allPlugins = withCorePlugins(plugins);
    const byId = new Map(configs.map((c) => [c.id, c]));
    const wanted = new Set<string>();
    const visit = (id: string) => {
        const cfg = byId.get(id);
        if (!cfg || wanted.has(id)) return;
        wanted.add(id);
        const plugin = allPlugins.find((p) => p.type === cfg.type);
        for (const dep of plugin?.getDependencies?.(cfg.config) ?? []) visit(dep);
    };
    ids.forEach(visit);
    return configs.filter((c) => wanted.has(c.id));
}

export async function resolveDatasources(options: ResolveDatasourcesOptions): Promise<ResolveDatasourcesResult> {
    const { configs, parameters, builtInFields, inherited, signal } = options;
    const plugins = withCorePlugins(options.plugins);
    const datasets: Record<string, Dataset> = { ...(inherited?.datasets ?? {}) };
    const errors = new Map<string, string>();
    const allConfigs = [...(inherited?.configs ?? []), ...configs];
    const byId = new Map(allConfigs.map((c) => [c.id, c]));
    const resolved = new Set<string>((inherited?.configs ?? []).filter((c) => datasets[c.name]).map((c) => c.id));
    const failed = new Set<string>((inherited?.configs ?? []).filter((c) => !datasets[c.name]).map((c) => c.id));

    const dependencies = new Map<string, string[]>();
    for (const cfg of configs) {
        const plugin = plugins.find((p) => p.type === cfg.type);
        const deps = plugin?.getDependencies?.(cfg.config) ?? [];
        dependencies.set(cfg.id, deps.filter((id) => id !== cfg.id && byId.has(id)));
    }

    const getDatasourceName = (id: string) => byId.get(id)?.name ?? id;
    const getDataset = (id: string) => {
        const cfg = byId.get(id);
        return cfg ? datasets[cfg.name] : undefined;
    };

    const buildContext = (): DatasourceFetchContext => {
        const exprBase: ExpressionContext = {
            datasources: toRowsMap(datasets),
            parameters,
            builtInFields,
        };
        return {
            parameters,
            datasources: { ...datasets },
            getDataset,
            getDatasourceName,
            builtInFields,
            signal,
            evaluate: async (expression, currentRow) => {
                const { result, error } = await evaluateExpression(expression, { ...exprBase, currentRow });
                if (error) throw new Error(`Invalid expression "${expression}": ${error}`);
                return result;
            },
            interpolate: (template, format) => interpolateTemplate(template, exprBase, format),
        };
    };

    let pending = configs.filter((c) => !resolved.has(c.id));
    while (pending.length > 0) {
        if (signal.aborted) break;
        const ready = pending.filter((c) => (dependencies.get(c.id) ?? []).every((d) => resolved.has(d) || failed.has(d)));
        if (ready.length === 0) {
            for (const cfg of pending) {
                errors.set(cfg.id, 'Circular dependency between datasources.');
                failed.add(cfg.id);
            }
            break;
        }

        const context = buildContext();
        await Promise.all(ready.map(async (cfg) => {
            const failedDeps = (dependencies.get(cfg.id) ?? []).filter((d) => failed.has(d));
            if (failedDeps.length > 0) {
                errors.set(cfg.id, `Depends on "${failedDeps.map(getDatasourceName).join('", "')}" which could not be loaded.`);
                failed.add(cfg.id);
                return;
            }
            const plugin = plugins.find((p) => p.type === cfg.type);
            if (!plugin) {
                errors.set(cfg.id, `No datasource plugin is registered for type "${cfg.type}".`);
                failed.add(cfg.id);
                return;
            }
            try {
                const dataset = await plugin.fetch(cfg.config, context);
                if (signal.aborted) return;
                datasets[cfg.name] = dataset;
                resolved.add(cfg.id);
                options.onDatasetResolved?.(cfg, dataset);
            } catch (err) {
                if (signal.aborted) return;
                errors.set(cfg.id, errorMessage(err));
                failed.add(cfg.id);
            }
        }));

        const readyIds = new Set(ready.map((c) => c.id));
        pending = pending.filter((c) => !readyIds.has(c.id));
    }

    return { datasets, errors };
}
