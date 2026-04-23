import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { evaluateExpression } from '../expression/expression-parser';
import type { ExpressionContext, GroupFrame } from '../expression/expression-types';
import type {
    ReportComponent,
    TableComponentProps,
    TableColumnDef,
    GlobalStyles,
    ConditionalFormat,
} from '../report-definition-types';
import { flattenColumns, getEffectiveColumnTree } from '../table-helpers';
import { useViewerContext, buildExpressionDatasources } from './ViewerExpressionContext';
import { CellItemsRenderer } from './CellItemRenderer';
import { NestedTableHeader } from './TableHeaderRenderer';
import { resolveRowGroups } from './row-group-engine';
import type { ResolvedGroupNode } from './row-group-engine';

interface Props {
    component: ReportComponent;
    styleCss: React.CSSProperties;
    globalStyles?: GlobalStyles;
}

type Row = Record<string, unknown>;

interface GroupedData {
    key: string;
    field: string;
    rows: Row[];
    children?: GroupedData[];
    depth: number;
}

function groupRows(rows: Row[], groupBy: string | string[]): GroupedData[] {
    const fields = Array.isArray(groupBy) ? groupBy : [groupBy];
    return groupRowsMultiLevel(rows, fields, 0);
}

function groupRowsMultiLevel(rows: Row[], fields: string[], depth: number): GroupedData[] {
    if (fields.length === 0) return [];
    const field = fields[0];
    const remaining = fields.slice(1);
    const map = new Map<string, Row[]>();
    for (const row of rows) {
        const key = String(row[field] ?? '(empty)');
        const arr = map.get(key);
        if (arr) arr.push(row);
        else map.set(key, [row]);
    }
    return Array.from(map.entries()).map(([key, groupedRows]) => ({
        key,
        field,
        rows: groupedRows,
        children: remaining.length > 0 ? groupRowsMultiLevel(groupedRows, remaining, depth + 1) : undefined,
        depth,
    }));
}

async function evalFormatExpr(
    expr: string,
    row: Row,
    ctx: ExpressionContext,
): Promise<string> {
    if (!expr) return '';
    const input = expr.startsWith('=') ? expr.slice(1) : expr;
    const fieldCtx: ExpressionContext = {
        ...ctx,
        currentRow: row,
        datasources: {
            ...ctx.datasources,
            Field: [row],
        },
    };
    const { result, error } = await evaluateExpression(input, fieldCtx);
    if (error) return `[Error: ${error}]`;
    return String(result ?? '');
}

function computeFrozenLeftOffsets(
    columns: TableColumnDef[],
    runtimeWidths?: Record<string, number>,
): Map<string, number> {
    const offsets = new Map<string, number>();
    let left = 0;
    for (const col of columns) {
        if (col.frozen) {
            offsets.set(col.id, left);
            const width = runtimeWidths?.[col.id] ?? (col.width ? parseInt(col.width, 10) || 120 : 120);
            left += width;
        }
    }
    return offsets;
}

function getColWidth(col: TableColumnDef, runtimeWidths: Record<string, number>): string | undefined {
    if (runtimeWidths[col.id]) return `${runtimeWidths[col.id]}px`;
    return col.width;
}

async function evalVisibilityExpr(
    expr: boolean | string | undefined,
    ctx: ExpressionContext,
    row?: Row,
): Promise<boolean> {
    if (expr === undefined || expr === true) return true;
    if (expr === false) return false;
    if (typeof expr !== 'string') return true;
    const input = expr.startsWith('=') ? expr.slice(1) : expr;
    const evalCtx: ExpressionContext = row
        ? { ...ctx, currentRow: row, datasources: { ...ctx.datasources, Field: [row] } }
        : ctx;
    const { result, error } = await evaluateExpression(input, evalCtx);
    if (error) return true;
    return result !== false && result !== 0 && result !== '' && result !== null && result !== undefined;
}

interface PivotResult {
    pivotColumns: string[];
    pivotRows: Array<{ rowKey: string; values: Record<string, unknown> }>;
}

function buildPivotData(
    rows: Row[],
    rowField: string,
    colField: string,
    valField: string,
    aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max',
): PivotResult {
    const colKeys = new Set<string>();
    const grouped = new Map<string, Map<string, number[]>>();

    for (const row of rows) {
        const rk = String(row[rowField] ?? '');
        const ck = String(row[colField] ?? '');
        const val = Number(row[valField]) || 0;
        colKeys.add(ck);
        if (!grouped.has(rk)) grouped.set(rk, new Map());
        const colMap = grouped.get(rk)!;
        if (!colMap.has(ck)) colMap.set(ck, []);
        colMap.get(ck)!.push(val);
    }

    const pivotColumns = Array.from(colKeys).sort();

    const pivotRows = Array.from(grouped.entries()).map(([rowKey, colMap]) => {
        const values: Record<string, unknown> = {};
        for (const ck of pivotColumns) {
            const nums = colMap.get(ck) ?? [];
            values[ck] = aggregate(nums, aggregation);
        }
        return { rowKey, values };
    });

    return { pivotColumns, pivotRows };
}

function aggregate(nums: number[], type: string): number {
    if (nums.length === 0) return 0;
    switch (type) {
        case 'sum': return nums.reduce((a, b) => a + b, 0);
        case 'count': return nums.length;
        case 'avg': return nums.reduce((a, b) => a + b, 0) / nums.length;
        case 'min': return Math.min(...nums);
        case 'max': return Math.max(...nums);
        default: return nums.reduce((a, b) => a + b, 0);
    }
}

export const TableRenderer: React.FC<Props> = ({ component, styleCss, globalStyles }) => {
    const viewerCtx = useViewerContext();
    const p = component.props as unknown as TableComponentProps;
    const drillThroughVariable = p.onDrillThrough;
    const columnTree = useMemo(() => getEffectiveColumnTree(p), [p]);
    const allColumns = useMemo(() => flattenColumns(columnTree), [columnTree]);
    const tableStyle = globalStyles?.table ?? {};

    const datasources = viewerCtx.datasources;
    const datasourceConfigs = viewerCtx.datasourceConfigs;

    const rawRows = useMemo<Row[]>(() => {
        if (!p.datasourceId) return [];
        const cfg = datasourceConfigs.find((d) => d.id === p.datasourceId);
        if (cfg && datasources[cfg.name]) {
            return datasources[cfg.name].rows;
        }
        return [];
    }, [p.datasourceId, datasources, datasourceConfigs]);

    const exprCtx: ExpressionContext = useMemo(() => ({
        datasources: buildExpressionDatasources(datasources),
        parameters: viewerCtx.parameters,
        variables: viewerCtx.variables,
        builtInFields: viewerCtx.builtInFields,
    }), [datasources, viewerCtx.parameters, viewerCtx.variables, viewerCtx.builtInFields]);

    const [visibleColIds, setVisibleColIds] = useState<Set<string> | null>(null);
    const [filteredRows, setFilteredRows] = useState<Row[]>(rawRows);

    useEffect(() => {
        const hasColVisibility = allColumns.some((c) => c.visible !== undefined && c.visible !== true);
        if (!hasColVisibility) {
            setVisibleColIds(null);
            return;
        }
        Promise.all(allColumns.map(async (col) => {
            const vis = await evalVisibilityExpr(col.visible, exprCtx);
            return vis ? col.id : null;
        })).then((ids) => {
            setVisibleColIds(new Set(ids.filter((id): id is string => id !== null)));
        });
    }, [allColumns, exprCtx]);

    useEffect(() => {
        if (!p.rowVisibleExpr) {
            setFilteredRows(rawRows);
            return;
        }
        Promise.all(rawRows.map(async (row) => {
            const vis = await evalVisibilityExpr(p.rowVisibleExpr, exprCtx, row);
            return vis ? row : null;
        })).then((results) => {
            setFilteredRows(results.filter((r): r is Row => r !== null));
        });
    }, [rawRows, p.rowVisibleExpr, exprCtx]);

    const onColumnResize = viewerCtx.onColumnResize;
    const onColumnReorder = viewerCtx.onColumnReorder;
    const componentId = component.id;

    const [runtimeWidths, setRuntimeWidths] = useState<Record<string, number>>({});
    const [columnOrder, setColumnOrder] = useState<string[] | null>(null);
    const [dragColId, setDragColId] = useState<string | null>(null);
    const [dragOverColId, setDragOverColId] = useState<string | null>(null);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);

    const visibleColumns = useMemo(() => {
        if (!visibleColIds) return allColumns;
        return allColumns.filter((c) => visibleColIds.has(c.id));
    }, [allColumns, visibleColIds]);

    const columns = useMemo(() => {
        if (!columnOrder) return visibleColumns;
        const colMap = new Map(visibleColumns.map((c) => [c.id, c]));
        const ordered: TableColumnDef[] = [];
        for (const id of columnOrder) {
            const col = colMap.get(id);
            if (col) ordered.push(col);
        }
        for (const col of visibleColumns) {
            if (!columnOrder.includes(col.id)) ordered.push(col);
        }
        return ordered;
    }, [visibleColumns, columnOrder]);

    const sortedRows = useMemo(() => {
        if (!sortField || !sortDir) return filteredRows;
        const sorted = [...filteredRows];
        sorted.sort((a, b) => {
            const av = a[sortField];
            const bv = b[sortField];
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            if (typeof av === 'number' && typeof bv === 'number') {
                return sortDir === 'asc' ? av - bv : bv - av;
            }
            const sa = String(av);
            const sb = String(bv);
            const cmp = sa.localeCompare(sb);
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return sorted;
    }, [filteredRows, sortField, sortDir]);

    const rows = sortedRows;

    const handleSort = useCallback((field: string) => {
        if (sortField === field) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') { setSortField(null); setSortDir(null); }
            else setSortDir('asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }, [sortField, sortDir]);

    const handleCellEdit = useCallback((rowIndex: number, field: string, value: unknown) => {
        viewerCtx.onCellEdit?.(componentId, rowIndex, field, value);
    }, [viewerCtx.onCellEdit, componentId]);

    const groups = useMemo(() => {
        if (p.groupBy && !p.pivotMode && (!p.rowGroups || p.rowGroups.length === 0)) {
            return groupRows(rows, p.groupBy);
        }
        return null;
    }, [rows, p.groupBy, p.pivotMode, p.rowGroups]);

    const [resolvedRowGroups, setResolvedRowGroups] = useState<ResolvedGroupNode[] | null>(null);
    const rowGroupsConfig = p.rowGroups;

    useEffect(() => {
        if (p.pivotMode) { setResolvedRowGroups(null); return; }
        if (!rowGroupsConfig || rowGroupsConfig.length === 0) { setResolvedRowGroups(null); return; }
        let cancelled = false;
        resolveRowGroups({
            rowGroups: rowGroupsConfig,
            rows,
            datasourceName: undefined,
            exprCtx,
            parentFrames: {},
        }).then((result) => {
            if (!cancelled) setResolvedRowGroups(result);
        });
        return () => { cancelled = true; };
    }, [rowGroupsConfig, rows, exprCtx, p.pivotMode]);

    const handleColumnResize = useCallback((colId: string, width: number) => {
        setRuntimeWidths((prev) => ({ ...prev, [colId]: width }));
        onColumnResize?.(componentId, colId, width);
    }, [onColumnResize, componentId]);

    const handleColumnDragStart = useCallback((colId: string) => {
        setDragColId(colId);
    }, []);

    const handleColumnDragOver = useCallback((colId: string) => {
        setDragOverColId(colId);
    }, []);

    const handleColumnDrop = useCallback((targetColId: string) => {
        if (!dragColId || dragColId === targetColId) {
            setDragColId(null);
            setDragOverColId(null);
            return;
        }
        const currentOrder = columnOrder ?? columns.map((c) => c.id);
        const fromIdx = currentOrder.indexOf(dragColId);
        const toIdx = currentOrder.indexOf(targetColId);
        if (fromIdx === -1 || toIdx === -1) return;
        const newOrder = [...currentOrder];
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, dragColId);
        setColumnOrder(newOrder);
        onColumnReorder?.(componentId, newOrder);
        setDragColId(null);
        setDragOverColId(null);
    }, [dragColId, columnOrder, columns, onColumnReorder, componentId]);

    const handleColumnDragEnd = useCallback(() => {
        setDragColId(null);
        setDragOverColId(null);
    }, []);

    const frozenOffsets = useMemo(
        () => computeFrozenLeftOffsets(columns, runtimeWidths),
        [columns, runtimeWidths],
    );
    const hasFrozen = frozenOffsets.size > 0;

    if (p.pivotMode && p.pivotRowField && p.pivotColumnField && p.pivotValueField) {
        return (
            <PivotTable
                rows={rows}
                p={p}
                styleCss={styleCss}
                tableStyle={tableStyle}
            />
        );
    }

    if (columns.length === 0) {
        return (
            <div style={{ padding: 16, color: 'var(--eui-text-muted)', fontSize: 12, fontStyle: 'italic', ...styleCss }}>
                Table has no columns configured.
            </div>
        );
    }

    const headerBg = tableStyle.headerBackground ?? 'var(--eui-bg-subtle)';
    const headerColor = tableStyle.headerColor ?? 'var(--eui-text)';
    const bodyColor = tableStyle.bodyColor ?? 'var(--eui-text)';
    const altRowColor = tableStyle.alternateRowColor;
    const cellBorder = tableStyle.cellBorder ?? '1px solid var(--eui-border-subtle)';

    const renderLeafHeader = (leafId: string, label: string, _align?: 'left' | 'center' | 'right') => {
        const col = columns.find((c) => c.id === leafId);
        if (!col) return null;
        const frozen = col.frozen && hasFrozen;
        const frozenStyle: React.CSSProperties = frozen ? {
            position: 'sticky',
            left: frozenOffsets.get(col.id) ?? 0,
            zIndex: 2,
        } : {};
        return (
            <ResizableHeader
                colId={col.id}
                width={getColWidth(col, runtimeWidths)}
                align={col.align}
                label={label}
                headerBg={headerBg}
                headerColor={headerColor}
                cellBorder={cellBorder}
                frozenStyle={frozenStyle}
                onResize={(w) => handleColumnResize(col.id, w)}
                isDragging={dragColId === col.id}
                isDragOver={dragOverColId === col.id}
                onDragStart={handleColumnDragStart}
                onDragOver={handleColumnDragOver}
                onDrop={handleColumnDrop}
                onDragEnd={handleColumnDragEnd}
                sortable={(p.enableSorting ?? false) && (col.sortable !== false)}
                sortDir={sortField === col.field ? sortDir : null}
                onSort={() => handleSort(col.field)}
            />
        );
    };

    const effectiveColumnTreeForHeader = useMemo(() => {
        const visSet = new Set(columns.map((c) => c.id));
        const prune = (nodes: typeof columnTree): typeof columnTree => {
            const out: typeof columnTree = [];
            for (const n of nodes) {
                if ('kind' in n && n.kind === 'group') {
                    const kids = prune(n.children);
                    if (kids.length > 0) out.push({ ...n, children: kids });
                } else if (visSet.has(n.id)) {
                    out.push(n);
                }
            }
            return out;
        };
        const pruned = prune(columnTree);
        if (pruned.length === 0) return columns.map((c) => ({ ...c, kind: 'column' as const }));
        return pruned;
    }, [columnTree, columns]);

    const tableElement = (
        <table
            style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
                color: bodyColor,
                ...styleCss,
            }}
            role="table"
            aria-label="Data table"
        >
            <NestedTableHeader
                tree={effectiveColumnTreeForHeader}
                headerBg={headerBg}
                headerColor={headerColor}
                cellBorder={cellBorder}
                renderLeafHeader={renderLeafHeader}
            />
            {p.headRows && p.headRows.length > 0 && (
                <thead>
                    {p.headRows.map((hr) => (
                        <ExtraRow
                            key={hr.id}
                            row={hr}
                            columns={columns}
                            exprCtx={exprCtx}
                            cellBorder={cellBorder}
                            isHeader
                        />
                    ))}
                </thead>
            )}
            <tbody>
                {resolvedRowGroups
                    ? resolvedRowGroups.map((node, i) => (
                        <RowGroupSection
                            key={`${node.group.id}-${i}`}
                            node={node}
                            parentFrames={{}}
                            columns={columns}
                            altRowColor={altRowColor}
                            cellBorder={cellBorder}
                            exprCtx={exprCtx}
                            tableStyle={tableStyle}
                            frozenOffsets={frozenOffsets}
                            hasFrozen={hasFrozen}
                            runtimeWidths={runtimeWidths}
                            drillThroughVariable={drillThroughVariable}
                            onDrillThrough={viewerCtx.onDrillThrough}
                            enableCellEdit={p.enableCellEdit}
                            onCellEdit={handleCellEdit}
                            depth={0}
                        />
                    ))
                    : groups
                        ? groups.map((group) => (
                            <GroupSection
                                key={`${group.field}-${group.key}`}
                                group={group}
                                columns={columns}
                                altRowColor={altRowColor}
                                cellBorder={cellBorder}
                                showFooter={p.showGroupFooter ?? false}
                                exprCtx={exprCtx}
                                tableStyle={tableStyle}
                                frozenOffsets={frozenOffsets}
                                hasFrozen={hasFrozen}
                                runtimeWidths={runtimeWidths}
                                groupVisibleExpr={p.groupVisibleExpr}
                                drillThroughVariable={drillThroughVariable}
                                onDrillThrough={viewerCtx.onDrillThrough}
                                enableCellEdit={p.enableCellEdit}
                                onCellEdit={handleCellEdit}
                            />
                        ))
                        : rows.length <= virtualThreshold
                            ? rows.map((row, idx) => (
                                <DataRow
                                    key={idx}
                                    row={row}
                                    rowIndex={idx}
                                    columns={columns}
                                    altRowColor={altRowColor}
                                    cellBorder={cellBorder}
                                    exprCtx={exprCtx}
                                    frozenOffsets={frozenOffsets}
                                    hasFrozen={hasFrozen}
                                    runtimeWidths={runtimeWidths}
                                    drillThroughVariable={drillThroughVariable}
                                    onDrillThrough={viewerCtx.onDrillThrough}
                                    enableCellEdit={p.enableCellEdit}
                                    onCellEdit={handleCellEdit}
                                />
                            ))
                            : null
                }
                {!resolvedRowGroups && !groups && rows.length === 0 && (
                    <tr>
                        <td
                            colSpan={columns.length}
                            style={{ padding: 16, textAlign: 'center', color: 'var(--eui-text-muted)', fontStyle: 'italic' }}
                        >
                            No data available.
                        </td>
                    </tr>
                )}
            </tbody>
            {p.footerRows && p.footerRows.length > 0 && (
                <tfoot>
                    {p.footerRows.map((fr) => (
                        <ExtraRow
                            key={fr.id}
                            row={fr}
                            columns={columns}
                            exprCtx={exprCtx}
                            cellBorder={cellBorder}
                        />
                    ))}
                </tfoot>
            )}
        </table>
    );

    const useVirtual = !groups && !resolvedRowGroups && rows.length > virtualThreshold;

    const handleCopyData = useCallback(() => {
        const header = columns.map((c) => c.label || c.field).join('\t');
        const body = rows.map((row) => columns.map((c) => formatRaw(row[c.field])).join('\t')).join('\n');
        const tsv = `${header}\n${body}`;
        navigator.clipboard.writeText(tsv).catch(() => {});
    }, [columns, rows]);

    const [copyFeedback, setCopyFeedback] = useState(false);

    return (
        <div style={{ overflowX: 'auto', border: `${cellBorder}`, borderRadius: 6 }}>
            {p.enableCopyData && rows.length > 0 && (
                <div
                    className="eui-rv-table-toolbar"
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '4px 8px',
                        borderBottom: cellBorder,
                        background: headerBg,
                    }}
                >
                    <button
                        onClick={() => {
                            handleCopyData();
                            setCopyFeedback(true);
                            setTimeout(() => setCopyFeedback(false), 1500);
                        }}
                        style={{
                            padding: '2px 8px',
                            fontSize: 11,
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 3,
                            background: 'transparent',
                            color: 'var(--eui-text-muted)',
                            cursor: 'pointer',
                        }}
                        title="Copy table data to clipboard"
                        aria-label="Copy table data to clipboard"
                    >
                        {copyFeedback ? 'Copied!' : 'Copy Data'}
                    </button>
                </div>
            )}
            {tableElement}
            {useVirtual && (
                <VirtualTableBody
                    rows={rows}
                    columns={columns}
                    altRowColor={altRowColor}
                    cellBorder={cellBorder}
                    exprCtx={exprCtx}
                    frozenOffsets={frozenOffsets}
                    hasFrozen={hasFrozen}
                    runtimeWidths={runtimeWidths}
                    drillThroughVariable={drillThroughVariable}
                    onDrillThrough={viewerCtx.onDrillThrough}
                    enableCellEdit={p.enableCellEdit}
                    onCellEdit={handleCellEdit}
                />
            )}
        </div>
    );
};

const PivotTable: React.FC<{
    rows: Row[];
    p: TableComponentProps;
    styleCss: React.CSSProperties;
    tableStyle: GlobalStyles['table'];
}> = ({ rows, p, styleCss, tableStyle }) => {
    const pivot = useMemo(
        () => buildPivotData(
            rows,
            p.pivotRowField!,
            p.pivotColumnField!,
            p.pivotValueField!,
            p.pivotAggregation ?? 'sum',
        ),
        [rows, p.pivotRowField, p.pivotColumnField, p.pivotValueField, p.pivotAggregation],
    );

    const headerBg = tableStyle?.headerBackground ?? 'var(--eui-bg-subtle)';
    const headerColor = tableStyle?.headerColor ?? 'var(--eui-text)';
    const bodyColor = tableStyle?.bodyColor ?? 'var(--eui-text)';
    const cellBorder = tableStyle?.cellBorder ?? '1px solid var(--eui-border-subtle)';
    const altRowColor = tableStyle?.alternateRowColor;

    return (
        <div style={{ overflowX: 'auto', border: cellBorder, borderRadius: 6 }}>
            <table
                style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: bodyColor, ...styleCss }}
                role="table"
                aria-label="Pivot table"
            >
                <thead>
                    <tr>
                        <th style={{ padding: '8px 10px', fontWeight: 600, background: headerBg, color: headerColor, borderBottom: cellBorder, textAlign: 'left' }}>
                            {p.pivotRowField}
                        </th>
                        {pivot.pivotColumns.map((ck) => (
                            <th key={ck} style={{ padding: '8px 10px', fontWeight: 600, background: headerBg, color: headerColor, borderBottom: cellBorder, textAlign: 'right' }}>
                                {ck}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pivot.pivotRows.map((pr, idx) => (
                        <tr key={pr.rowKey} style={{ background: altRowColor && idx % 2 === 1 ? altRowColor : undefined }}>
                            <td style={{ padding: '6px 10px', borderBottom: cellBorder, fontWeight: 500 }}>
                                {pr.rowKey}
                            </td>
                            {pivot.pivotColumns.map((ck) => (
                                <td key={ck} style={{ padding: '6px 10px', borderBottom: cellBorder, textAlign: 'right' }}>
                                    {formatRaw(pr.values[ck])}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {pivot.pivotRows.length === 0 && (
                        <tr>
                            <td
                                colSpan={pivot.pivotColumns.length + 1}
                                style={{ padding: 16, textAlign: 'center', color: 'var(--eui-text-muted)', fontStyle: 'italic' }}
                            >
                                No data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const RowGroupSection: React.FC<{
    node: ResolvedGroupNode;
    parentFrames: Record<string, GroupFrame>;
    columns: TableColumnDef[];
    altRowColor?: string;
    cellBorder: string;
    exprCtx: ExpressionContext;
    tableStyle: GlobalStyles['table'];
    frozenOffsets: Map<string, number>;
    hasFrozen: boolean;
    runtimeWidths: Record<string, number>;
    drillThroughVariable?: string;
    onDrillThrough?: (variableName: string, value: unknown) => void;
    enableCellEdit?: boolean;
    onCellEdit?: (rowIndex: number, field: string, value: unknown) => void;
    depth: number;
}> = ({ node, parentFrames, columns, altRowColor, cellBorder, exprCtx, tableStyle, frozenOffsets, hasFrozen, runtimeWidths, drillThroughVariable, onDrillThrough, enableCellEdit, onCellEdit, depth }) => {
    const [collapsed, setCollapsed] = useState(false);
    const frames = useMemo(
        () => ({ ...parentFrames, [node.group.name]: node.frame }),
        [parentFrames, node.frame, node.group.name],
    );
    const rowExprCtx = useMemo<ExpressionContext>(
        () => ({ ...exprCtx, rowGroups: frames, variables: node.frame.variables }),
        [exprCtx, frames, node.frame.variables],
    );

    const indent = depth * 16;
    const keyDisplay = node.keys && node.keys.length > 0
        ? node.keys.map((k) => String(k ?? '')).join(' / ')
        : node.values.length > 0
            ? `${node.values.length} rows`
            : '';

    const hasChildren = node.children && node.children.length > 0;
    const leafRows = node.leafRows ?? [];
    const isParentKind = node.group.groupKind === 'parent';

    return (
        <>
            {isParentKind && (
                <tr
                    style={{ cursor: 'pointer', background: 'var(--eui-bg-subtle)' }}
                    onClick={() => setCollapsed((v) => !v)}
                    role="row"
                    aria-expanded={!collapsed}
                >
                    <td
                        colSpan={columns.length}
                        style={{
                            padding: '6px 10px',
                            paddingLeft: 10 + indent,
                            fontWeight: 600,
                            fontSize: 12,
                            borderBottom: cellBorder,
                            color: 'var(--eui-text)',
                        }}
                    >
                        <span style={{ marginRight: 6, display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>
                            ▾
                        </span>
                        <span style={{ color: 'var(--eui-text-muted)', fontSize: 10, marginRight: 4 }}>{node.group.name}:</span>
                        {keyDisplay}
                    </td>
                </tr>
            )}
            {!collapsed && hasChildren && node.children!.map((child, i) => (
                <RowGroupSection
                    key={`${child.group.id}-${i}`}
                    node={child}
                    parentFrames={frames}
                    columns={columns}
                    altRowColor={altRowColor}
                    cellBorder={cellBorder}
                    exprCtx={exprCtx}
                    tableStyle={tableStyle}
                    frozenOffsets={frozenOffsets}
                    hasFrozen={hasFrozen}
                    runtimeWidths={runtimeWidths}
                    drillThroughVariable={drillThroughVariable}
                    onDrillThrough={onDrillThrough}
                    enableCellEdit={enableCellEdit}
                    onCellEdit={onCellEdit}
                    depth={depth + 1}
                />
            ))}
            {!collapsed && !hasChildren && leafRows.map((row, idx) => (
                <DataRow
                    key={idx}
                    row={row}
                    rowIndex={idx}
                    columns={columns}
                    altRowColor={altRowColor}
                    cellBorder={cellBorder}
                    exprCtx={rowExprCtx}
                    frozenOffsets={frozenOffsets}
                    hasFrozen={hasFrozen}
                    runtimeWidths={runtimeWidths}
                    drillThroughVariable={drillThroughVariable}
                    onDrillThrough={onDrillThrough}
                    enableCellEdit={enableCellEdit}
                    onCellEdit={onCellEdit}
                />
            ))}
            {!collapsed && !hasChildren && node.group.showFooter && leafRows.length > 0 && (
                <tr style={{
                    background: tableStyle?.footerBackground ?? 'var(--eui-bg-subtle)',
                    color: tableStyle?.footerColor ?? 'var(--eui-text-muted)',
                }}>
                    {columns.map((col) => (
                        <td
                            key={col.id}
                            style={{
                                padding: '6px 10px',
                                paddingLeft: 10 + indent,
                                fontWeight: 600,
                                fontSize: 11,
                                borderBottom: cellBorder,
                                textAlign: col.align ?? 'left',
                            }}
                        >
                            <GroupFooterCell col={col} rows={leafRows} exprCtx={rowExprCtx} />
                        </td>
                    ))}
                </tr>
            )}
        </>
    );
};

const GroupSection: React.FC<{
    group: GroupedData;
    columns: TableColumnDef[];
    altRowColor?: string;
    cellBorder: string;
    showFooter: boolean;
    exprCtx: ExpressionContext;
    tableStyle: GlobalStyles['table'];
    frozenOffsets: Map<string, number>;
    hasFrozen: boolean;
    runtimeWidths: Record<string, number>;
    groupVisibleExpr?: string;
    drillThroughVariable?: string;
    onDrillThrough?: (variableName: string, value: unknown) => void;
    enableCellEdit?: boolean;
    onCellEdit?: (rowIndex: number, field: string, value: unknown) => void;
}> = ({ group, columns, altRowColor, cellBorder, showFooter, exprCtx, tableStyle, frozenOffsets, hasFrozen, runtimeWidths, groupVisibleExpr, drillThroughVariable, onDrillThrough, enableCellEdit, onCellEdit }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [groupVisible, setGroupVisible] = useState(true);

    useEffect(() => {
        if (!groupVisibleExpr) {
            setGroupVisible(true);
            return;
        }
        const groupRow: Row = { _groupKey: group.key, _groupCount: group.rows.length };
        evalVisibilityExpr(groupVisibleExpr, exprCtx, groupRow).then(setGroupVisible);
    }, [groupVisibleExpr, exprCtx, group.key, group.rows.length]);

    if (!groupVisible) return null;

    const indent = group.depth * 16;
    const hasChildren = group.children && group.children.length > 0;

    return (
        <>
            <tr
                style={{ cursor: 'pointer', background: 'var(--eui-bg-subtle)' }}
                onClick={() => setCollapsed((v) => !v)}
                role="row"
                aria-expanded={!collapsed}
            >
                <td
                    colSpan={columns.length}
                    style={{
                        padding: '6px 10px',
                        paddingLeft: 10 + indent,
                        fontWeight: 600,
                        fontSize: 12,
                        borderBottom: cellBorder,
                        color: 'var(--eui-text)',
                    }}
                >
                    <span style={{ marginRight: 6, display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>
                        ▾
                    </span>
                    <span style={{ color: 'var(--eui-text-muted)', fontSize: 10, marginRight: 4 }}>{group.field}:</span>
                    {group.key} ({group.rows.length})
                </td>
            </tr>
            {!collapsed && hasChildren && group.children!.map((childGroup) => (
                <GroupSection
                    key={`${childGroup.field}-${childGroup.key}`}
                    group={childGroup}
                    columns={columns}
                    altRowColor={altRowColor}
                    cellBorder={cellBorder}
                    showFooter={showFooter}
                    exprCtx={exprCtx}
                    tableStyle={tableStyle}
                    frozenOffsets={frozenOffsets}
                    hasFrozen={hasFrozen}
                    runtimeWidths={runtimeWidths}
                    groupVisibleExpr={groupVisibleExpr}
                    drillThroughVariable={drillThroughVariable}
                    onDrillThrough={onDrillThrough}
                    enableCellEdit={enableCellEdit}
                    onCellEdit={onCellEdit}
                />
            ))}
            {!collapsed && !hasChildren && group.rows.map((row, idx) => (
                <DataRow
                    key={idx}
                    row={row}
                    rowIndex={idx}
                    columns={columns}
                    altRowColor={altRowColor}
                    cellBorder={cellBorder}
                    exprCtx={exprCtx}
                    frozenOffsets={frozenOffsets}
                    hasFrozen={hasFrozen}
                    runtimeWidths={runtimeWidths}
                    drillThroughVariable={drillThroughVariable}
                    onDrillThrough={onDrillThrough}
                    enableCellEdit={enableCellEdit}
                    onCellEdit={onCellEdit}
                />
            ))}
            {!collapsed && !hasChildren && showFooter && (
                <tr style={{
                    background: tableStyle?.footerBackground ?? 'var(--eui-bg-subtle)',
                    color: tableStyle?.footerColor ?? 'var(--eui-text-muted)',
                }}>
                    {columns.map((col) => (
                        <td
                            key={col.id}
                            style={{
                                padding: '6px 10px',
                                paddingLeft: 10 + indent,
                                fontWeight: 600,
                                fontSize: 11,
                                borderBottom: cellBorder,
                                textAlign: col.align ?? 'left',
                            }}
                        >
                            <GroupFooterCell col={col} rows={group.rows} exprCtx={exprCtx} />
                        </td>
                    ))}
                </tr>
            )}
        </>
    );
};

const GroupFooterCell: React.FC<{
    col: TableColumnDef;
    rows: Row[];
    exprCtx: ExpressionContext;
}> = ({ col, rows, exprCtx }) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        if (!col.formatExpr) {
            setValue('');
            return;
        }
        const aggregateRow: Row = {};
        for (const field of Object.keys(rows[0] ?? {})) {
            const vals = rows.map((r) => r[field]).filter((v) => typeof v === 'number') as number[];
            if (vals.length > 0) {
                aggregateRow[field] = vals.reduce((a, b) => a + b, 0);
            }
        }
        evalFormatExpr(col.formatExpr, aggregateRow, exprCtx)
            .then(setValue)
            .catch(() => setValue(''));
    }, [col.formatExpr, rows, exprCtx]);

    return <>{value}</>;
};

const DataRow: React.FC<{
    row: Row;
    rowIndex: number;
    columns: TableColumnDef[];
    altRowColor?: string;
    cellBorder: string;
    exprCtx: ExpressionContext;
    frozenOffsets: Map<string, number>;
    hasFrozen: boolean;
    runtimeWidths: Record<string, number>;
    drillThroughVariable?: string;
    onDrillThrough?: (variableName: string, value: unknown) => void;
    enableCellEdit?: boolean;
    onCellEdit?: (rowIndex: number, field: string, value: unknown) => void;
}> = ({ row, rowIndex, columns, altRowColor, cellBorder, exprCtx, frozenOffsets, hasFrozen, runtimeWidths, drillThroughVariable, onDrillThrough, enableCellEdit, onCellEdit }) => {
    const bg = altRowColor && rowIndex % 2 === 1 ? altRowColor : undefined;
    const clickable = !!drillThroughVariable && !!onDrillThrough;

    const handleClick = useCallback(() => {
        if (drillThroughVariable && onDrillThrough) {
            onDrillThrough(drillThroughVariable, row);
        }
    }, [drillThroughVariable, onDrillThrough, row]);

    return (
        <tr
            style={{ background: bg, cursor: clickable ? 'pointer' : undefined }}
            onClick={clickable ? handleClick : undefined}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
        >
            {columns.map((col) => (
                <CellRenderer
                    key={col.id}
                    col={col}
                    row={row}
                    rowIndex={rowIndex}
                    cellBorder={cellBorder}
                    exprCtx={exprCtx}
                    frozenOffset={col.frozen && hasFrozen ? frozenOffsets.get(col.id) : undefined}
                    rowBg={bg}
                    resolvedWidth={getColWidth(col, runtimeWidths)}
                    editable={enableCellEdit}
                    onCellEdit={onCellEdit}
                />
            ))}
        </tr>
    );
};

const CellRenderer: React.FC<{
    col: TableColumnDef;
    row: Row;
    rowIndex: number;
    cellBorder: string;
    exprCtx: ExpressionContext;
    frozenOffset?: number;
    rowBg?: string;
    resolvedWidth?: string;
    editable?: boolean;
    onCellEdit?: (rowIndex: number, field: string, value: unknown) => void;
}> = ({ col, row, rowIndex, cellBorder, exprCtx, frozenOffset, rowBg, resolvedWidth, editable, onCellEdit }) => {
    const rawValue = row[col.field];
    const [display, setDisplay] = useState<string>(() => formatRaw(rawValue));
    const [condStyle, setCondStyle] = useState<React.CSSProperties>({});
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const hasCellItems = !!col.cellItems && col.cellItems.length > 0;

    const evalFormat = useCallback(async () => {
        if (hasCellItems) {
            setDisplay('');
        } else if (col.formatExpr) {
            const result = await evalFormatExpr(col.formatExpr, row, exprCtx);
            setDisplay(result);
        } else {
            setDisplay(formatRaw(rawValue));
        }
        const cs = await evalConditionalFormats(col.conditionalFormats, row, exprCtx);
        setCondStyle(cs);
    }, [col.formatExpr, col.conditionalFormats, row, exprCtx, rawValue, hasCellItems]);

    useEffect(() => {
        evalFormat();
    }, [evalFormat]);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const canEdit = editable && col.editable !== false && !col.formatExpr;

    const handleDoubleClick = useCallback(() => {
        if (!canEdit) return;
        setEditValue(formatRaw(rawValue));
        setEditing(true);
    }, [canEdit, rawValue]);

    const commitEdit = useCallback(() => {
        setEditing(false);
        const newValue = typeof rawValue === 'number' ? (Number(editValue) || 0) : editValue;
        if (String(newValue) !== formatRaw(rawValue)) {
            onCellEdit?.(rowIndex, col.field, newValue);
        }
    }, [editValue, rawValue, onCellEdit, rowIndex, col.field]);

    const cancelEdit = useCallback(() => {
        setEditing(false);
    }, []);

    const frozenStyle: React.CSSProperties = frozenOffset !== undefined ? {
        position: 'sticky',
        left: frozenOffset,
        zIndex: 1,
        background: rowBg ?? 'var(--eui-bg)',
    } : {};

    return (
        <td
            style={{
                padding: editing ? '2px 4px' : '6px 10px',
                textAlign: col.align ?? 'left',
                borderBottom: cellBorder,
                width: resolvedWidth ?? col.width,
                ...frozenStyle,
                ...condStyle,
            }}
            onDoubleClick={handleDoubleClick}
        >
            {editing ? (
                <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit();
                        if (e.key === 'Escape') cancelEdit();
                    }}
                    style={{
                        width: '100%',
                        padding: '3px 6px',
                        border: '1px solid var(--eui-primary)',
                        borderRadius: 3,
                        background: 'var(--eui-bg)',
                        color: 'var(--eui-text)',
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                    aria-label={`Edit ${col.label}`}
                />
            ) : hasCellItems ? (
                <CellItemsRenderer
                    items={col.cellItems!}
                    row={row}
                    exprCtx={exprCtx}
                />
            ) : display}
        </td>
    );
};

async function evalConditionalFormats(
    formats: ConditionalFormat[] | undefined,
    row: Row,
    ctx: ExpressionContext,
): Promise<React.CSSProperties> {
    if (!formats || formats.length === 0) return {};
    const fieldCtx: ExpressionContext = {
        ...ctx,
        datasources: { ...ctx.datasources, Field: [row] },
    };
    const merged: React.CSSProperties = {};
    for (const fmt of formats) {
        if (!fmt.expression) continue;
        const { result } = await evaluateExpression(fmt.expression, fieldCtx);
        if (result) {
            if (fmt.backgroundColor) merged.backgroundColor = fmt.backgroundColor;
            if (fmt.textColor) merged.color = fmt.textColor;
            if (fmt.fontWeight && fmt.fontWeight !== 'normal') merged.fontWeight = fmt.fontWeight;
            if (fmt.fontStyle && fmt.fontStyle !== 'normal') merged.fontStyle = fmt.fontStyle;
        }
    }
    return merged;
}

function formatRaw(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

const virtualRowHeight = 33;
const virtualThreshold = 100;
const overscan = 10;

const ExtraRow: React.FC<{
    row: import('../report-definition-types').TableExtraRow;
    columns: TableColumnDef[];
    exprCtx: ExpressionContext;
    cellBorder: string;
    isHeader?: boolean;
}> = ({ row, columns, exprCtx, cellBorder, isHeader }) => {
    const [cellTexts, setCellTexts] = useState<string[]>(() => row.cells.map(() => ''));

    useEffect(() => {
        let cancelled = false;
        Promise.all(
            row.cells.map(async (cell) => {
                if (!cell.textExpression) return '';
                const { result, error } = await evaluateExpression(cell.textExpression, exprCtx);
                if (error) return `[${error}]`;
                return formatRaw(result);
            }),
        ).then((vals) => {
            if (!cancelled) setCellTexts(vals);
        });
        return () => { cancelled = true; };
    }, [row, exprCtx]);

    const Cell: 'th' | 'td' = isHeader ? 'th' : 'td';
    const totalLeaves = columns.length;

    let covered = 0;
    return (
        <tr>
            {row.cells.map((c, i) => {
                const span = Math.max(1, c.colSpan ?? 1);
                covered += span;
                if (covered > totalLeaves) return null;
                const css: React.CSSProperties = {
                    padding: '6px 10px',
                    textAlign: c.align ?? 'left',
                    borderBottom: cellBorder,
                    borderRight: cellBorder,
                    fontWeight: isHeader ? 600 : undefined,
                    background: isHeader ? 'var(--eui-bg-subtle)' : undefined,
                };
                if (c.style) {
                    if (c.style.textColor) css.color = c.style.textColor;
                    if (c.style.backgroundColor) css.background = c.style.backgroundColor;
                    if (c.style.fontWeight) css.fontWeight = c.style.fontWeight;
                    if (c.style.fontStyle) css.fontStyle = c.style.fontStyle;
                    if (c.style.textAlign) css.textAlign = c.style.textAlign;
                    if (c.style.fontSize) css.fontSize = c.style.fontSize;
                }
                return (
                    <Cell key={i} colSpan={span} style={css}>
                        {cellTexts[i] ?? ''}
                    </Cell>
                );
            })}
        </tr>
    );
};

const VirtualTableBody: React.FC<{
    rows: Row[];
    columns: TableColumnDef[];
    altRowColor?: string;
    cellBorder: string;
    exprCtx: ExpressionContext;
    frozenOffsets: Map<string, number>;
    hasFrozen: boolean;
    runtimeWidths: Record<string, number>;
    drillThroughVariable?: string;
    onDrillThrough?: (variableName: string, value: unknown) => void;
    enableCellEdit?: boolean;
    onCellEdit?: (rowIndex: number, field: string, value: unknown) => void;
}> = ({ rows, columns, altRowColor, cellBorder, exprCtx, frozenOffsets, hasFrozen, runtimeWidths, drillThroughVariable, onDrillThrough, enableCellEdit, onCellEdit }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(400);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerHeight(entry.contentRect.height);
            }
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const startIdx = Math.max(0, Math.floor(scrollTop / virtualRowHeight) - overscan);
    const endIdx = Math.min(rows.length, Math.ceil((scrollTop + containerHeight) / virtualRowHeight) + overscan);
    const visibleRows = rows.slice(startIdx, endIdx);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ maxHeight: 600, overflowY: 'auto' }}
            onScroll={handleScroll}
        >
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13,
                }}
                role="table"
            >
                <tbody>
                    {startIdx > 0 && (
                        <tr style={{ height: startIdx * virtualRowHeight }} aria-hidden="true">
                            <td colSpan={columns.length} />
                        </tr>
                    )}
                    {visibleRows.map((row, idx) => (
                        <DataRow
                            key={startIdx + idx}
                            row={row}
                            rowIndex={startIdx + idx}
                            columns={columns}
                            altRowColor={altRowColor}
                            cellBorder={cellBorder}
                            exprCtx={exprCtx}
                            frozenOffsets={frozenOffsets}
                            hasFrozen={hasFrozen}
                            runtimeWidths={runtimeWidths}
                            drillThroughVariable={drillThroughVariable}
                            onDrillThrough={onDrillThrough}
                            enableCellEdit={enableCellEdit}
                            onCellEdit={onCellEdit}
                        />
                    ))}
                    {endIdx < rows.length && (
                        <tr style={{ height: (rows.length - endIdx) * virtualRowHeight }} aria-hidden="true">
                            <td colSpan={columns.length} />
                        </tr>
                    )}
                </tbody>
            </table>
            <div aria-live="polite" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                Showing rows {startIdx + 1} to {endIdx} of {rows.length}
            </div>
        </div>
    );
};

const ResizableHeader: React.FC<{
    colId: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    label: string;
    headerBg: string;
    headerColor: string;
    cellBorder: string;
    frozenStyle: React.CSSProperties;
    onResize: (newWidth: number) => void;
    isDragging?: boolean;
    isDragOver?: boolean;
    onDragStart?: (colId: string) => void;
    onDragOver?: (colId: string) => void;
    onDrop?: (colId: string) => void;
    onDragEnd?: () => void;
    sortable?: boolean;
    sortDir?: 'asc' | 'desc' | null;
    onSort?: () => void;
}> = ({ colId, width, align, label, headerBg, headerColor, cellBorder, frozenStyle, onResize, isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd, sortable, sortDir: headerSortDir, onSort }) => {
    const thRef = useRef<HTMLTableCellElement>(null);
    const startXRef = useRef(0);
    const startWRef = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const th = thRef.current;
        if (!th) return;
        startXRef.current = e.clientX;
        startWRef.current = th.offsetWidth;

        const handleMouseMove = (ev: MouseEvent) => {
            const delta = ev.clientX - startXRef.current;
            const newWidth = Math.max(40, startWRef.current + delta);
            onResize(newWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [onResize]);

    return (
        <th
            ref={thRef}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', colId);
                onDragStart?.(colId);
            }}
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                onDragOver?.(colId);
            }}
            onDrop={(e) => {
                e.preventDefault();
                onDrop?.(colId);
            }}
            onDragEnd={() => onDragEnd?.()}
            onClick={sortable ? (e) => { if (!(e.target as HTMLElement).closest('[role="separator"]')) onSort?.(); } : undefined}
            style={{
                padding: '8px 10px',
                textAlign: align ?? 'left',
                fontWeight: 600,
                background: isDragOver ? 'var(--eui-primary-soft)' : headerBg,
                color: headerColor,
                borderBottom: cellBorder,
                whiteSpace: 'nowrap',
                width,
                position: 'relative',
                opacity: isDragging ? 0.4 : 1,
                cursor: sortable ? 'pointer' : 'grab',
                borderLeft: isDragOver ? '2px solid var(--eui-primary)' : undefined,
                userSelect: sortable ? 'none' : undefined,
                ...frozenStyle,
            }}
            aria-sort={headerSortDir === 'asc' ? 'ascending' : headerSortDir === 'desc' ? 'descending' : undefined}
        >
            {label}
            {sortable && headerSortDir && (
                <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>
                    {headerSortDir === 'asc' ? '▲' : '▼'}
                </span>
            )}
            <div
                onMouseDown={handleMouseDown}
                role="separator"
                aria-orientation="vertical"
                aria-label={`Resize ${label} column`}
                tabIndex={0}
                onKeyDown={(e) => {
                    const th = thRef.current;
                    if (!th) return;
                    const currentW = th.offsetWidth;
                    if (e.key === 'ArrowLeft') { e.preventDefault(); onResize(Math.max(40, currentW - 10)); }
                    if (e.key === 'ArrowRight') { e.preventDefault(); onResize(currentW + 10); }
                }}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: -2,
                    width: 5,
                    height: '100%',
                    cursor: 'col-resize',
                    zIndex: 3,
                }}
            />
        </th>
    );
};
