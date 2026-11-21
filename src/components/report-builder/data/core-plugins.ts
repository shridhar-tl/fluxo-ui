import { BranchIcon, DatabaseIcon } from '../../../assets/icons';
import type { DatasourcePlugin } from '../report-builder-types';
import type { DatasetField, DatasourceConfig, DerivedDatasourceConfig, InheritedDatasource } from '../report-definition-types';
import { inferDerivedSchema } from './derived-schema';
import { applyTransform } from './derived-transforms';

export const derivedDatasourceType = 'derived';
export const inheritedDatasourceType = 'inherited';

export function getDerivedDependencies(config: DerivedDatasourceConfig): string[] {
    const ids = new Set<string>();
    if (config.sourceDatasourceId) ids.add(config.sourceDatasourceId);
    for (const t of config.transforms ?? []) {
        if (t.type === 'join' && t.datasourceId) ids.add(t.datasourceId);
        if (t.type === 'union') for (const id of t.datasourceIds) if (id) ids.add(id);
    }
    return Array.from(ids);
}

export const derivedDatasourcePlugin: DatasourcePlugin = {
    type: derivedDatasourceType,
    name: 'Derived',
    description: 'Preprocess another datasource: filter, sort, group, join, append, pivot, compute columns and more.',
    icon: BranchIcon,
    category: 'Transform',
    initialConfig: () => ({ sourceDatasourceId: '', transforms: [] }),
    describe: (config) => {
        const cfg = config as unknown as DerivedDatasourceConfig;
        const count = cfg.transforms?.length ?? 0;
        return count === 0 ? 'No transforms' : `${count} transform${count === 1 ? '' : 's'}`;
    },
    getDependencies: (config) => getDerivedDependencies(config as unknown as DerivedDatasourceConfig),
    fetch: async (config, context) => {
        const cfg = config as unknown as DerivedDatasourceConfig;
        if (!cfg.sourceDatasourceId) throw new Error('Choose the source datasource.');
        const source = context.getDataset(cfg.sourceDatasourceId);
        if (!source) throw new Error('The source datasource has no data.');
        const runtime = {
            evaluate: context.evaluate,
            getDataset: context.getDataset,
            getDatasourceName: context.getDatasourceName,
        };
        const sourceName = runtime.getDatasourceName(cfg.sourceDatasourceId);
        let rows = source.rows;
        for (const transform of cfg.transforms ?? []) {
            rows = await applyTransform(transform, rows, runtime, sourceName);
        }
        const fields = await inferDerivedSchema(source.fields, cfg.transforms ?? [], {
            resolveFields: async (id) => context.getDataset(id)?.fields ?? [],
            getDatasourceName: runtime.getDatasourceName,
        });
        return { rows, fields: fields.length > 0 ? fields : source.fields };
    },
    inferSchema: async (config, context) => {
        const cfg = config as unknown as DerivedDatasourceConfig;
        if (!cfg.sourceDatasourceId) return [];
        const sourceFields = await context.resolveFields(cfg.sourceDatasourceId);
        return inferDerivedSchema(sourceFields, cfg.transforms ?? [], {
            resolveFields: context.resolveFields,
            getDatasourceName: (id) => context.datasources.find((d) => d.id === id)?.name ?? id,
        });
    },
};

export const inheritedDatasourcePlugin: DatasourcePlugin = {
    type: inheritedDatasourceType,
    name: 'From parent report',
    description: 'Data supplied by the report that embeds this report as a sub-report.',
    icon: DatabaseIcon,
    initialConfig: () => ({ fields: [] }),
    describe: () => 'Supplied by the parent report',
    fetch: async () => {
        throw new Error('This datasource is supplied by the parent report. Open the parent report to see its data.');
    },
    inferSchema: (config) => (config.fields as DatasetField[] | undefined) ?? [],
};

export const corePlugins: DatasourcePlugin[] = [derivedDatasourcePlugin, inheritedDatasourcePlugin];

export function withCorePlugins(plugins: DatasourcePlugin[]): DatasourcePlugin[] {
    const hostTypes = new Set(plugins.map((p) => p.type));
    return [...plugins, ...corePlugins.filter((p) => !hostTypes.has(p.type))];
}

export function inheritedToConfig(ds: InheritedDatasource): DatasourceConfig {
    return {
        id: ds.id,
        name: ds.name,
        type: inheritedDatasourceType,
        config: { fields: ds.fields },
    };
}
