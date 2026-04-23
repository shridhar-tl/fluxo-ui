import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { evaluateExpression } from '../expression/expression-parser';
import type { ExpressionContext } from '../expression/expression-types';
import type { ReportComponent, RepeaterComponentProps } from '../report-definition-types';
import { ComponentErrorBoundary } from './ComponentErrorBoundary';
import { ComponentRenderer } from './ComponentRenderer';
import { ViewerContext, buildExpressionDatasources, useViewerContext } from './ViewerExpressionContext';

type Row = Record<string, unknown>;

interface Props {
    component: ReportComponent;
    styleCss: React.CSSProperties;
    depth: number;
}

async function evalToArray(expr: string, ctx: ExpressionContext): Promise<Row[]> {
    const input = expr.startsWith('=') ? expr.slice(1) : expr;
    const { result } = await evaluateExpression(input, ctx);
    if (Array.isArray(result)) return result as Row[];
    return [];
}

async function evalToBool(expr: string, ctx: ExpressionContext): Promise<boolean> {
    const input = expr.startsWith('=') ? expr.slice(1) : expr;
    const { result, error } = await evaluateExpression(input, ctx);
    if (error) return false;
    return result !== false && result !== 0 && result !== '' && result !== null && result !== undefined;
}

async function evalAny(expr: string, ctx: ExpressionContext): Promise<unknown> {
    const input = expr.startsWith('=') ? expr.slice(1) : expr;
    const { result } = await evaluateExpression(input, ctx);
    return result;
}

async function evalToNumber(raw: number | string | undefined, ctx: ExpressionContext): Promise<number> {
    if (raw === undefined || raw === null || raw === '') return 0;
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
    if (typeof raw === 'string' && raw.startsWith('=')) {
        const { result } = await evaluateExpression(raw.slice(1), ctx);
        const n = Number(result);
        return Number.isFinite(n) ? n : 0;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
}

function compareSortKey(a: unknown, b: unknown): number {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
}

export const RepeaterRenderer: React.FC<Props> = ({ component, styleCss, depth }) => {
    const parentCtx = useViewerContext();
    const p = component.props as unknown as RepeaterComponentProps;

    const [rows, setRows] = useState<Row[] | null>(null);
    const [loading, setLoading] = useState(true);

    const parentExprCtx = useMemo<ExpressionContext>(() => ({
        datasources: buildExpressionDatasources(parentCtx.datasources),
        parameters: parentCtx.parameters,
        variables: parentCtx.variables,
        builtInFields: parentCtx.builtInFields,
        currentRow: parentCtx.currentRow,
    }), [parentCtx.datasources, parentCtx.parameters, parentCtx.variables, parentCtx.builtInFields, parentCtx.currentRow]);

    const dsName = useMemo(() => {
        if (!p.datasourceId) return null;
        return parentCtx.datasourceConfigs.find((d) => d.id === p.datasourceId)?.name ?? null;
    }, [parentCtx.datasourceConfigs, p.datasourceId]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            let baseRows: Row[] = [];
            if (dsName) {
                const ds = parentCtx.datasources[dsName];
                if (ds && Array.isArray(ds.rows)) baseRows = ds.rows;
            } else if (p.datasetExpression && p.datasetExpression.trim() !== '') {
                baseRows = await evalToArray(p.datasetExpression, parentExprCtx);
            }

            if (p.filter && p.filter.trim() !== '') {
                const filtered: Row[] = [];
                for (const row of baseRows) {
                    const ok = await evalToBool(p.filter, { ...parentExprCtx, currentRow: row });
                    if (ok) filtered.push(row);
                }
                baseRows = filtered;
            }

            if (p.sortBy && p.sortBy.trim() !== '') {
                const decorated = await Promise.all(
                    baseRows.map(async (row) => ({
                        row,
                        key: await evalAny(p.sortBy!, { ...parentExprCtx, currentRow: row }),
                    })),
                );
                decorated.sort((a, b) => compareSortKey(a.key, b.key));
                if (p.sortDirection === 'desc') decorated.reverse();
                baseRows = decorated.map((d) => d.row);
            }

            const offsetN = await evalToNumber(p.offset, parentExprCtx);
            if (offsetN > 0) {
                baseRows = baseRows.slice(offsetN);
            }
            const limitN = await evalToNumber(p.limit, parentExprCtx);
            if (limitN > 0) {
                baseRows = baseRows.slice(0, limitN);
            }

            if (!cancelled) {
                setRows(baseRows);
                setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dsName, parentExprCtx, p.datasetExpression, p.filter, p.sortBy, p.sortDirection, p.offset, p.limit, parentCtx.datasources]);

    if (loading && rows === null) {
        return (
            <div style={styleCss}>
                <div className="eui-rb-viewer-shimmer" style={{ height: 48 }} aria-hidden="true" />
            </div>
        );
    }

    const resolved = rows ?? [];

    if (resolved.length === 0) {
        if (p.hideWhenEmpty) return null;
        return (
            <div style={styleCss}>
                <div className="eui-rv-repeater-empty" role="status">
                    {p.emptyMessage ?? 'No items to display.'}
                </div>
            </div>
        );
    }

    const layout = p.layout ?? 'stack';
    const gap = p.gap ?? 8;
    const gridColumns = p.gridColumns ?? 2;
    const inlineWrap = p.inlineWrap ?? true;
    const separator = p.separator ?? 'none';

    const containerStyle: React.CSSProperties = (() => {
        if (layout === 'grid') {
            return {
                display: 'grid',
                gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                gap,
                ...styleCss,
            };
        }
        if (layout === 'inline') {
            return {
                display: 'flex',
                flexDirection: 'row',
                flexWrap: inlineWrap ? 'wrap' : 'nowrap',
                gap,
                ...styleCss,
            };
        }
        return {
            display: 'flex',
            flexDirection: 'column',
            gap,
            ...styleCss,
        };
    })();

    return (
        <div style={containerStyle} role="list" aria-label="Repeater">
            {resolved.map((row, index) => (
                <RepeaterIteration
                    key={index}
                    row={row}
                    index={index}
                    count={resolved.length}
                    component={component}
                    depth={depth}
                    alternate={Boolean(p.alternateRowBackground)}
                    separator={separator}
                    isLast={index === resolved.length - 1}
                />
            ))}
        </div>
    );
};

interface IterationProps {
    row: Row;
    index: number;
    count: number;
    component: ReportComponent;
    depth: number;
    alternate: boolean;
    separator: 'none' | 'line' | 'gap';
    isLast: boolean;
}

const RepeaterIteration: React.FC<IterationProps> = ({
    row,
    index,
    count,
    component,
    depth,
    alternate,
    separator,
    isLast,
}) => {
    const parentCtx = useViewerContext();

    const iterationVariables = useMemo<Record<string, unknown>>(() => ({
        iterationIndex: index,
        iterationCount: count,
        iterationNumber: index + 1,
        isFirst: index === 0,
        isLast: index === count - 1,
        isEven: index % 2 === 0,
        isOdd: index % 2 !== 0,
    }), [index, count]);

    const iterCtx = useMemo(() => ({
        ...parentCtx,
        currentRow: row,
        variables: { ...parentCtx.variables, ...iterationVariables },
    }), [parentCtx, row, iterationVariables]);

    const children = component.children ?? [];
    const altClass = alternate && index % 2 === 1 ? 'alt' : '';

    return (
        <>
            <div
                role="listitem"
                className={classNames('eui-rv-repeater-item', altClass)}
                style={{
                    padding: alternate ? 6 : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                }}
            >
                <ComponentErrorBoundary componentId={`${component.id}:${index}`}>
                    <ViewerContext.Provider value={iterCtx}>
                        {children.map((child) => (
                            <ComponentRenderer key={child.id} component={child} depth={depth + 1} />
                        ))}
                    </ViewerContext.Provider>
                </ComponentErrorBoundary>
            </div>
            {separator !== 'none' && !isLast && (
                <div className={classNames('eui-rv-repeater-sep', separator)} aria-hidden="true" />
            )}
        </>
    );
};
