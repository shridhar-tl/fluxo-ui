import type { DatasourcePlugin, DatasourceSchemaContext } from '../report-builder-types';
import type { DatasetField, DatasourceConfig } from '../report-definition-types';
import { mergeFields } from '../dataset-schema';
import { withCorePlugins } from './core-plugins';

export interface SchemaResolver {
    resolveFields: (datasourceId: string) => Promise<DatasetField[]>;
    isIntrospectable: (datasourceId: string) => boolean;
}

const noFields: DatasetField[] = [];

function findCyclicIds(configs: DatasourceConfig[], plugins: DatasourcePlugin[]): Set<string> {
    const deps = new Map<string, string[]>();
    for (const cfg of configs) {
        const plugin = plugins.find((p) => p.type === cfg.type);
        deps.set(cfg.id, plugin?.getDependencies?.(cfg.config) ?? []);
    }
    const cyclic = new Set<string>();
    for (const cfg of configs) {
        const seen = new Set<string>();
        const stack = [...(deps.get(cfg.id) ?? [])];
        while (stack.length > 0) {
            const id = stack.pop() as string;
            if (id === cfg.id) {
                cyclic.add(cfg.id);
                break;
            }
            if (seen.has(id)) continue;
            seen.add(id);
            stack.push(...(deps.get(id) ?? []));
        }
    }
    return cyclic;
}

export function createSchemaResolver(configs: DatasourceConfig[], hostPlugins: DatasourcePlugin[]): SchemaResolver {
    const plugins = withCorePlugins(hostPlugins);
    const byId = new Map(configs.map((c) => [c.id, c]));
    const cyclic = findCyclicIds(configs, plugins);
    const cache = new Map<string, Promise<DatasetField[]>>();

    async function compute(cfg: DatasourceConfig, chain: ReadonlySet<string>): Promise<DatasetField[]> {
        const plugin = plugins.find((p) => p.type === cfg.type);
        if (plugin?.inferSchema) {
            const nextChain = new Set(chain).add(cfg.id);
            const context: DatasourceSchemaContext = {
                datasources: configs,
                resolveFields: (id) => resolve(id, nextChain),
            };
            try {
                const fields = await plugin.inferSchema(cfg.config, context);
                if (fields.length > 0) return mergeFields(fields, cfg.cachedSchema);
            } catch {
                return cfg.cachedSchema ?? noFields;
            }
        }
        return cfg.cachedSchema ?? noFields;
    }

    function resolve(id: string, chain: ReadonlySet<string>): Promise<DatasetField[]> {
        const cfg = byId.get(id);
        if (!cfg) return Promise.resolve(noFields);
        if (chain.has(id) || cyclic.has(id)) return Promise.resolve(cfg.cachedSchema ?? noFields);
        const cached = cache.get(id);
        if (cached) return cached;
        const promise = compute(cfg, chain);
        cache.set(id, promise);
        return promise;
    }

    function isIntrospectable(id: string): boolean {
        const cfg = byId.get(id);
        if (!cfg) return false;
        if (cfg.cachedSchema && cfg.cachedSchema.length > 0) return true;
        return !!plugins.find((p) => p.type === cfg.type)?.inferSchema;
    }

    return { resolveFields: (id) => resolve(id, new Set()), isIntrospectable };
}
