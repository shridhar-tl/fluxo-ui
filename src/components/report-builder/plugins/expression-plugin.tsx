import React, { useMemo } from 'react';
import { CodeIcon } from '../../../assets/icons';
import { inferFieldsFromRows } from '../dataset-schema';
import { ExpressionEditor } from '../expression/ExpressionEditor';
import type { DatasourceConfigUIProps, DatasourcePlugin } from '../report-builder-types';
import type { DatasourceConfig } from '../report-definition-types';
import { useBuilderTypeContext } from '../components/props/ExpressionField';

interface ExpressionDatasourceConfig {
    expression: string;
    dependencyIds: string[];
}

const datasourceRefPattern = /Datasources\.([A-Za-z_][A-Za-z0-9_]*)/g;

function findDependencies(expression: string, datasources: DatasourceConfig[]): string[] {
    const names = new Set(Array.from(expression.matchAll(datasourceRefPattern)).map((m) => m[1]));
    return datasources.filter((d) => names.has(d.name)).map((d) => d.id);
}

function toRows(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) {
        if (value === null || value === undefined) return [];
        return [value !== null && typeof value === 'object' ? value as Record<string, unknown> : { value }];
    }
    return value.map((r) => (r !== null && typeof r === 'object' && !Array.isArray(r) ? r as Record<string, unknown> : { value: r }));
}

const ExpressionConfigUI: React.FC<DatasourceConfigUIProps> = ({ datasourceId, config, onChange, datasources }) => {
    const cfg = config as unknown as ExpressionDatasourceConfig;
    const others = useMemo(() => datasources.filter((d) => d.id !== datasourceId), [datasources, datasourceId]);
    const typeContext = useBuilderTypeContext(undefined);
    const inputId = `rb-expr-ds-${datasourceId}`;

    return (
        <div className="eui-rb-plugin-config">
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={inputId}>Expression returning a list of rows</label>
                <ExpressionEditor
                    id={inputId}
                    value={cfg.expression ?? ''}
                    onChange={(expression) => onChange({ expression, dependencyIds: findDependencies(expression, others) } as unknown as Record<string, unknown>)}
                    typeContext={typeContext}
                    placeholder="e.g. Distinct(Datasources.Issues, 'assignee')"
                    multiline
                />
            </div>
            <span className="eui-rb-ds-config-hint">A list of values becomes rows with a single "value" field.</span>
        </div>
    );
};

export function createExpressionDatasourcePlugin(): DatasourcePlugin {
    return {
        type: 'expression',
        name: 'Expression',
        description: 'Build rows from an expression over parameters and other datasources.',
        icon: CodeIcon,
        category: 'Transform',
        initialConfig: () => ({ expression: '', dependencyIds: [] }),
        ConfigUI: ExpressionConfigUI,
        describe: (config) => (config.expression as string) || 'No expression yet',
        getDependencies: (config) => (config as unknown as ExpressionDatasourceConfig).dependencyIds ?? [],
        fetch: async (config, context) => {
            const cfg = config as unknown as ExpressionDatasourceConfig;
            if (!cfg.expression?.trim()) return { rows: [], fields: [] };
            const rows = toRows(await context.evaluate(cfg.expression));
            return { rows, fields: inferFieldsFromRows(rows) };
        },
    };
}
