import { useEffect, useMemo, useState } from 'react';
import { inheritedToConfig } from './data/core-plugins';
import { createSchemaResolver } from './data/schema-resolver';
import type { SchemaResolver } from './data/schema-resolver';
import { flattenFieldPaths, suggestDisplayColumns, type SuggestedColumn } from './data/value-utils';
import { useReportBuilderContext, useRBStore } from './report-builder-context';
import type { DatasetField, DatasourceConfig, ParameterConfig } from './report-definition-types';

const noInherited: DatasourceConfig[] = [];
const noParameters: ParameterConfig[] = [];

export function useInheritedDatasources(): DatasourceConfig[] {
    const parentContext = useRBStore((s) => s.definition.parentContext);
    return useMemo(
        () => (parentContext ? parentContext.datasources.map(inheritedToConfig) : noInherited),
        [parentContext],
    );
}

export function useInheritedParameters(): ParameterConfig[] {
    const parentContext = useRBStore((s) => s.definition.parentContext);
    return parentContext?.parameters ?? noParameters;
}

/** Datasources a component can bind to: the report's own plus those supplied by the parent report. */
export function useBuilderDatasources(): DatasourceConfig[] {
    const own = useRBStore((s) => s.definition.datasources);
    const inherited = useInheritedDatasources();
    return useMemo(() => (inherited.length === 0 ? own : [...inherited, ...own]), [own, inherited]);
}

export function useSchemaResolver(): SchemaResolver {
    const { datasourcePlugins } = useReportBuilderContext();
    const datasources = useBuilderDatasources();
    return useMemo(() => createSchemaResolver(datasources, datasourcePlugins), [datasources, datasourcePlugins]);
}

export interface DatasourceFieldsState {
    fields: DatasetField[];
    loading: boolean;
    supported: boolean;
}

const emptyFields: DatasetField[] = [];

export function useDatasourceFields(datasourceId: string | undefined): DatasourceFieldsState {
    const resolver = useSchemaResolver();
    const [state, setState] = useState<{ id: string | undefined; fields: DatasetField[] }>({ id: undefined, fields: emptyFields });

    useEffect(() => {
        if (!datasourceId) return;
        let cancelled = false;
        resolver.resolveFields(datasourceId).then((fields) => {
            if (!cancelled) setState({ id: datasourceId, fields });
        });
        return () => { cancelled = true; };
    }, [datasourceId, resolver]);

    const isSameDatasource = !!datasourceId && state.id === datasourceId;
    return {
        fields: isSameDatasource ? state.fields : emptyFields,
        loading: !!datasourceId && !isSameDatasource,
        supported: datasourceId ? resolver.isIntrospectable(datasourceId) : false,
    };
}

/** Dotted paths of every scalar / object field of a datasource, for field pickers. */
export function useDatasourceFieldPaths(datasourceId: string | undefined): string[] {
    const { fields } = useDatasourceFields(datasourceId);
    return useMemo(() => flattenFieldPaths(fields).map((f) => f.path), [fields]);
}

export function useSuggestedColumns(datasourceId: string | undefined): SuggestedColumn[] {
    const { fields } = useDatasourceFields(datasourceId);
    return useMemo(() => suggestDisplayColumns(fields), [fields]);
}
