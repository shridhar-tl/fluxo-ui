import { evaluateExpression } from '../expression/expression-parser';
import type { ExpressionContext, GroupFrame } from '../expression/expression-types';
import type { TableRowGroup } from '../report-definition-types';

type Row = Record<string, unknown>;

export interface ResolvedGroupNode {
    group: TableRowGroup;
    key: unknown;
    keys?: unknown[];
    values: Row[];
    frame: GroupFrame;
    children?: ResolvedGroupNode[];
    leafRows?: Row[];
}

const MAX_GROUP_RECURSION_DEPTH = 16;

export interface RowGroupResolverOptions {
    rowGroups: TableRowGroup[];
    rows: Row[];
    datasourceName: string | undefined;
    exprCtx: ExpressionContext;
    parentFrames: Record<string, GroupFrame>;
}

export async function resolveRowGroups(opts: RowGroupResolverOptions): Promise<ResolvedGroupNode[]> {
    return resolveGroupLevel(opts.rowGroups, opts.rows, opts.datasourceName, opts.exprCtx, opts.parentFrames, 0);
}

async function resolveGroupLevel(
    groups: TableRowGroup[],
    parentRows: Row[],
    parentDsName: string | undefined,
    exprCtx: ExpressionContext,
    parentFrames: Record<string, GroupFrame>,
    depth: number,
): Promise<ResolvedGroupNode[]> {
    if (depth > MAX_GROUP_RECURSION_DEPTH) return [];
    const result: ResolvedGroupNode[] = [];

    for (const g of groups) {
        let data: Row[] = parentRows;

        if (g.datasetId === '__expression__' && g.datasetExpression) {
            const { result: expressionResult } = await evaluateExpression(g.datasetExpression, {
                ...exprCtx,
                rowGroups: parentFrames,
            });
            if (Array.isArray(expressionResult)) data = expressionResult as Row[];
            else data = [];
        } else if (g.datasetId) {
            const ds = exprCtx.datasources?.[g.datasetId];
            if (Array.isArray(ds)) data = ds as Row[];
        }

        if (g.visible) {
            const { result: visibleResult } = await evaluateExpression(g.visible, {
                ...exprCtx,
                rowGroups: parentFrames,
            });
            if (visibleResult === false) continue;
        }

        if (g.filter) {
            const filtered: Row[] = [];
            for (const row of data) {
                const { result: ok } = await evaluateExpression(g.filter, {
                    ...exprCtx,
                    currentRow: row,
                    rowGroups: parentFrames,
                });
                if (ok !== false && ok !== 0 && ok !== null && ok !== undefined && ok !== '') {
                    filtered.push(row);
                }
            }
            data = filtered;
        }

        if (g.sortBy) {
            const decorated = await Promise.all(
                data.map(async (row) => {
                    const { result: sortKey } = await evaluateExpression(g.sortBy!, {
                        ...exprCtx,
                        currentRow: row,
                        rowGroups: parentFrames,
                    });
                    return { row, sortKey };
                }),
            );
            decorated.sort((a, b) => {
                const av = a.sortKey;
                const bv = b.sortKey;
                if (av == null && bv == null) return 0;
                if (av == null) return 1;
                if (bv == null) return -1;
                if (typeof av === 'number' && typeof bv === 'number') return av - bv;
                return String(av).localeCompare(String(bv));
            });
            data = decorated.map((d) => d.row);
        }

        const computeGroupVariables = async (rows: Row[]): Promise<Record<string, unknown>> => {
            const vars: Record<string, unknown> = {};
            if (!g.variables) return vars;
            const selfFrame: GroupFrame = {
                name: g.name,
                values: rows,
                fields: rows[0] ?? {},
            };
            const frames = { ...parentFrames, [g.name]: selfFrame };
            for (const v of g.variables) {
                const { result: val } = await evaluateExpression(v.expression, {
                    ...exprCtx,
                    rowGroups: frames,
                });
                vars[v.key] = val;
            }
            return vars;
        };

        const hasKeys = g.keys && g.keys.length > 0;
        if (hasKeys) {
            const buckets = new Map<string, { keys: unknown[]; rows: Row[] }>();
            for (const row of data) {
                const keyValues: unknown[] = [];
                for (const kExpr of g.keys!) {
                    const { result: kv } = await evaluateExpression(kExpr, {
                        ...exprCtx,
                        currentRow: row,
                        rowGroups: parentFrames,
                    });
                    keyValues.push(kv);
                }
                const bucketKey = JSON.stringify(keyValues);
                if (!buckets.has(bucketKey)) {
                    buckets.set(bucketKey, { keys: keyValues, rows: [] });
                }
                buckets.get(bucketKey)!.rows.push(row);
            }

            for (const [, bucket] of buckets) {
                const bucketVars = await computeGroupVariables(bucket.rows);
                const frame: GroupFrame = {
                    name: g.name,
                    key: bucket.keys.length === 1 ? bucket.keys[0] : bucket.keys,
                    keys: bucket.keys,
                    values: bucket.rows,
                    fields: bucket.rows[0] ?? {},
                    variables: bucketVars,
                };
                const nextFrames = { ...parentFrames, [g.name]: frame };

                let children: ResolvedGroupNode[] | undefined;
                let leafRows: Row[] | undefined;
                if (g.children && g.children.length > 0) {
                    children = await resolveGroupLevel(
                        g.children,
                        bucket.rows,
                        parentDsName,
                        exprCtx,
                        nextFrames,
                        depth + 1,
                    );
                } else if (g.groupKind === 'details') {
                    leafRows = bucket.rows;
                }

                result.push({
                    group: g,
                    key: frame.key,
                    keys: frame.keys,
                    values: bucket.rows,
                    frame,
                    children,
                    leafRows,
                });
            }
        } else {
            const vars = await computeGroupVariables(data);
            const frame: GroupFrame = {
                name: g.name,
                key: undefined,
                values: data,
                fields: data[0] ?? {},
                variables: vars,
            };
            const nextFrames = { ...parentFrames, [g.name]: frame };

            let children: ResolvedGroupNode[] | undefined;
            let leafRows: Row[] | undefined;
            if (g.children && g.children.length > 0) {
                children = await resolveGroupLevel(
                    g.children,
                    data,
                    parentDsName,
                    exprCtx,
                    nextFrames,
                    depth + 1,
                );
            } else {
                leafRows = data;
            }

            result.push({
                group: g,
                key: undefined,
                values: data,
                frame,
                children,
                leafRows,
            });
        }
    }

    return result;
}
