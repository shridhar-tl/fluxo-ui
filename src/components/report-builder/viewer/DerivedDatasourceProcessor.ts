import type { Dataset } from '../report-builder-types';
import type { DerivedDatasourceConfig, DerivedTransform } from '../report-definition-types';
import { evaluateExpression } from '../expression/expression-parser';

export async function processDerivedDatasource(
    config: DerivedDatasourceConfig,
    allDatasources: Record<string, Dataset>,
    datasourceNameById: Record<string, string>,
    parameters: Record<string, unknown>,
): Promise<Dataset> {
    const sourceName = datasourceNameById[config.sourceDatasourceId];
    if (!sourceName) {
        throw new Error(`Source datasource not found for id "${config.sourceDatasourceId}"`);
    }
    const sourceDs = allDatasources[sourceName];
    if (!sourceDs) {
        throw new Error(`Source datasource "${sourceName}" has no data`);
    }

    let rows = [...sourceDs.rows];

    for (const transform of config.transforms) {
        rows = await applyTransform(transform, rows, allDatasources, parameters);
    }

    const fields = rows.length > 0
        ? Object.keys(rows[0]).map((name) => ({
            name,
            type: inferFieldType(rows[0][name]),
        }))
        : sourceDs.fields;

    return { rows, fields };
}

function inferFieldType(value: unknown): 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
}

async function applyTransform(
    transform: DerivedTransform,
    rows: Record<string, unknown>[],
    allDatasources: Record<string, Dataset>,
    parameters: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
    switch (transform.type) {
        case 'flatten':
            return applyFlatten(rows, transform.childField);
        case 'pick':
            return applyPick(rows, transform.fields);
        case 'filter':
            return applyFilter(rows, transform.expression, allDatasources, parameters);
        case 'computed':
            return applyComputed(rows, transform.columns, allDatasources, parameters);
        default:
            return rows;
    }
}

function applyFlatten(
    rows: Record<string, unknown>[],
    childField: string,
): Record<string, unknown>[] {
    const result: Record<string, unknown>[] = [];
    for (const row of rows) {
        const children = row[childField];
        if (Array.isArray(children)) {
            for (const child of children) {
                if (typeof child === 'object' && child !== null) {
                    const parentFields = { ...row };
                    delete parentFields[childField];
                    result.push({ ...parentFields, ...(child as Record<string, unknown>) });
                }
            }
        } else {
            result.push(row);
        }
    }
    return result;
}

function applyPick(
    rows: Record<string, unknown>[],
    fields: Array<{ source: string; alias?: string }>,
): Record<string, unknown>[] {
    return rows.map((row) => {
        const picked: Record<string, unknown> = {};
        for (const { source, alias } of fields) {
            picked[alias ?? source] = row[source];
        }
        return picked;
    });
}

async function applyFilter(
    rows: Record<string, unknown>[],
    expression: string,
    allDatasources: Record<string, Dataset>,
    parameters: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
    const dsContext: Record<string, Record<string, unknown>[]> = {};
    for (const [name, ds] of Object.entries(allDatasources)) {
        dsContext[name] = ds.rows;
    }

    const result: Record<string, unknown>[] = [];
    for (const row of rows) {
        const ctx = {
            datasources: dsContext,
            parameters,
            currentRow: row,
        };
        const { result: val } = await evaluateExpression(expression, ctx);
        if (val) {
            result.push(row);
        }
    }
    return result;
}

async function applyComputed(
    rows: Record<string, unknown>[],
    columns: Array<{ name: string; expression: string }>,
    allDatasources: Record<string, Dataset>,
    parameters: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
    const dsContext: Record<string, Record<string, unknown>[]> = {};
    for (const [name, ds] of Object.entries(allDatasources)) {
        dsContext[name] = ds.rows;
    }

    const result: Record<string, unknown>[] = [];
    for (const row of rows) {
        const newRow = { ...row };
        for (const col of columns) {
            const ctx = {
                datasources: dsContext,
                parameters,
                currentRow: row,
            };
            const { result: val } = await evaluateExpression(col.expression, ctx);
            newRow[col.name] = val;
        }
        result.push(newRow);
    }
    return result;
}
