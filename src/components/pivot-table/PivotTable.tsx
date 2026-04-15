import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { DragDropProvider } from '../drag-drop';
import PivotCellEditor from './PivotCellEditor';
import PivotConfigPanel from './PivotConfigPanel';
import { buildColumnTree, buildPivotTree, detectFieldType, getCellValue, getNestedValue, setNestedValue, sortPivotNodes } from './pivot-engine';
import type { CellTemplateProps, ColumnNode, FieldDefinition, PivotNode, PivotSort, PivotTableProps } from './pivot-table-types';
import './PivotTable.scss';

const expandIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const collapseIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const sortAscIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12l7-7 7 7" />
    </svg>
);

const sortDescIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19V5M5 12l7 7 7-7" />
    </svg>
);

const defaultPermissions = {
    allowDragDrop: true,
    allowAddRows: true,
    allowAddColumns: true,
    allowAddValues: true,
    allowAddFilters: true,
    allowRemoveFields: true,
    allowChangeAggregation: true,
    allowSort: true,
    allowFilter: true,
    allowEdit: true,
    allowExport: true,
    allowExpandCollapse: true,
    allowConfigPanel: true,
};

function PivotTable<T extends Record<string, unknown> = Record<string, unknown>>({
    data,
    config,
    fieldDefinitions,
    onConfigChange,
    onDataChange,
    defaultExpandedRows,
    expandAll = false,
    showGrandTotal = true,
    showSubTotals = true,
    sortable = true,
    striped = false,
    bordered = true,
    compact = false,
    className,
    emptyMessage = 'No data available',
    maxDepth: _maxDepth = 10,
    showToolbar = false,
    showConfigPanel = false,
    configPanelPosition = 'left',
    configPanelCollapsible = true,
    permissions: permissionsProp,
    plugins = [],
    disabledFunctions = [],
    editable = false,
    editConfig: editConfigProp,
    onCellEdit,
    exportable = false,
    onExport,
    headerTemplate,
    rowHeaderTemplate,
    cellTemplate,
    loading = false,
    height,
}: PivotTableProps<T>) {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
        () => new Set(defaultExpandedRows || (expandAll ? ['__all__'] : [])),
    );
    const [currentSort, setCurrentSort] = useState<PivotSort | null>(null);
    const [editingCell, setEditingCell] = useState<{ nodeKey: string; colKey: string; rowIdx: number; field: string } | null>(null);
    const [configPanelCollapsed, setConfigPanelCollapsed] = useState(false);

    const permissions = useMemo(
        () => ({ ...defaultPermissions, ...permissionsProp }),
        [permissionsProp],
    );

    const editConfig = useMemo(() => ({
        mode: 'doubleClick' as const,
        showEditIcon: false,
        editIconPosition: 'right' as const,
        commitOnBlur: true,
        commitOnEnter: true,
        cancelOnEscape: true,
        selectAllOnFocus: true,
        highlightOnEdit: true,
        showConfirmCancel: false,
        ...editConfigProp,
    }), [editConfigProp]);

    const fieldDefMap = useMemo(() => {
        const map: Record<string, FieldDefinition> = {};
        fieldDefinitions?.forEach((fd) => { map[fd.field] = fd; });
        return map;
    }, [fieldDefinitions]);

    const fieldTypeMap = useMemo(() => {
        const map: Record<string, string> = {};
        if (data.length > 0) {
            const allKeys = new Set<string>();
            data.slice(0, 20).forEach((row) => Object.keys(row).forEach((k) => allKeys.add(k)));
            allKeys.forEach((k) => {
                const def = fieldDefMap[k];
                map[k] = def?.dataType || detectFieldType(data as Record<string, unknown>[], k);
            });
        }
        return map;
    }, [data, fieldDefMap]);

    const pluginEditors = useMemo(() => {
        const editors: Record<string, React.ComponentType<import('./pivot-table-types').CellEditorProps>> = {};
        plugins.forEach((p) => {
            if (p.cellEditors) Object.assign(editors, p.cellEditors);
        });
        return editors;
    }, [plugins]);

    const pluginRenderers = useMemo(() => {
        const renderers: Record<string, React.ComponentType<CellTemplateProps>> = {};
        plugins.forEach((p) => {
            if (p.cellRenderers) Object.assign(renderers, p.cellRenderers);
        });
        return renderers;
    }, [plugins]);

    const pivotRoot = useMemo(
        () => buildPivotTree(data as Record<string, unknown>[], config, plugins, disabledFunctions),
        [data, config, plugins, disabledFunctions],
    );

    const { columns: columnTree, leafColumns } = useMemo(
        () => buildColumnTree(data as Record<string, unknown>[], config),
        [data, config],
    );

    const isExpanded = useCallback(
        (key: string) => expandedKeys.has('__all__') || expandedKeys.has(key),
        [expandedKeys],
    );

    const toggleExpand = useCallback((key: string) => {
        if (!permissions.allowExpandCollapse) return;
        setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (next.has('__all__')) {
                next.delete('__all__');
                next.delete(key);
            } else if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }, [permissions.allowExpandCollapse]);

    const expandAllRows = useCallback(() => setExpandedKeys(new Set(['__all__'])), []);
    const collapseAllRows = useCallback(() => setExpandedKeys(new Set()), []);

    const handleSort = useCallback((field: string) => {
        if (!sortable || !permissions.allowSort) return;
        setCurrentSort((prev) => {
            if (prev?.field === field) {
                if (prev.direction === 'asc') return { field, direction: 'desc' };
                if (prev.direction === 'desc') return null;
            }
            return { field, direction: 'asc' };
        });
    }, [sortable, permissions.allowSort]);

    const handleConfigChange = useCallback(
        (newConfig: typeof config) => {
            onConfigChange?.(newConfig);
        },
        [onConfigChange],
    );

    const startEdit = useCallback(
        (node: PivotNode, colKey: string) => {
            if (!editable || !permissions.allowEdit || !node.isLeaf || !node.sourceRows?.length) return;

            const parts = colKey.split('__');
            const fieldAgg = parts[0];
            const underscoreIdx = fieldAgg.lastIndexOf('_');
            const field = fieldAgg.substring(0, underscoreIdx);

            const fieldDef = fieldDefMap[field];
            if (fieldDef?.editable === false) return;
            if (permissions.readOnlyFields?.includes(field)) return;
            if (permissions.editableFields && !permissions.editableFields.includes(field)) return;

            setEditingCell({
                nodeKey: node.key,
                colKey,
                rowIdx: 0,
                field,
            });
        },
        [editable, permissions, fieldDefMap],
    );

    const handleCellEditCommit = useCallback(
        (node: PivotNode, field: string, newValue: unknown) => {
            setEditingCell(null);
            if (!node.sourceRows?.length) return;

            const row = node.sourceRows[0];
            const oldValue = getNestedValue(row, field);

            const fieldDef = fieldDefMap[field];
            if (fieldDef?.validators) {
                for (const validator of fieldDef.validators) {
                    const error = validator(newValue);
                    if (error) return;
                }
            }

            let finalValue = newValue;
            for (const plugin of plugins) {
                if (plugin.onBeforeEdit) {
                    finalValue = plugin.onBeforeEdit(row, field, finalValue);
                }
            }

            if (onCellEdit) {
                const result = onCellEdit(row as T, field, oldValue, finalValue);
                if (result === false) return;
            }

            const rowIndex = (data as Record<string, unknown>[]).indexOf(row);
            if (rowIndex >= 0 && onDataChange) {
                const updatedRow = setNestedValue(row, field, finalValue) as T;
                const newData = [...data];
                newData[rowIndex] = updatedRow;
                onDataChange(newData, rowIndex, field, finalValue);
            }

            for (const plugin of plugins) {
                if (plugin.onAfterEdit) {
                    plugin.onAfterEdit(row, field, finalValue);
                }
            }
        },
        [data, fieldDefMap, plugins, onCellEdit, onDataChange],
    );

    const handleExport = useCallback(
        (format: 'csv' | 'json') => {
            if (onExport) {
                onExport(format);
                return;
            }

            if (format === 'json') {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                downloadBlob(blob, 'pivot-data.json');
            } else {
                const headers = [...config.rows, ...config.values.map((v) => v.label)];
                const csvRows = [headers.join(',')];
                data.forEach((row) => {
                    const cells = [
                        ...config.rows.map((r) => String(getNestedValue(row as Record<string, unknown>, r) ?? '')),
                        ...config.values.map((v) => String(getNestedValue(row as Record<string, unknown>, v.field) ?? '')),
                    ];
                    csvRows.push(cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(','));
                });
                const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                downloadBlob(blob, 'pivot-data.csv');
            }
        },
        [data, config, onExport],
    );

    const renderCellContent = (
        node: PivotNode,
        colKey: string,
        raw: number | string,
        formatted: string,
    ): React.ReactNode => {
        const parts = colKey.split('__');
        const fieldAgg = parts[0];
        const underscoreIdx = fieldAgg.lastIndexOf('_');
        const field = fieldAgg.substring(0, underscoreIdx);

        const fieldDef = fieldDefMap[field];
        const vf = config.values.find((v) => `${v.field}_${v.aggregateFunction || 'sum'}` === fieldAgg);

        const pluginRenderer = pluginRenderers[field];
        if (pluginRenderer) {
            const Renderer = pluginRenderer;
            return <Renderer value={raw} field={field} row={node.sourceRows?.[0] || {}} formattedValue={formatted} />;
        }

        if (vf?.template) {
            const tpl = vf.template;
            if (typeof tpl === 'function' && !(tpl as React.ComponentType<CellTemplateProps>).prototype?.isReactComponent && tpl.length === 2) {
                return (tpl as (value: unknown, row: Record<string, unknown>) => React.ReactNode)(raw, node.sourceRows?.[0] || {});
            }
            const Template = tpl as React.ComponentType<CellTemplateProps>;
            return <Template value={raw} field={field} row={node.sourceRows?.[0] || {}} formattedValue={formatted} />;
        }

        if (fieldDef?.template) {
            const tpl = fieldDef.template;
            if (typeof tpl === 'function' && !(tpl as React.ComponentType<CellTemplateProps>).prototype?.isReactComponent && tpl.length === 2) {
                return (tpl as (value: unknown, row: Record<string, unknown>) => React.ReactNode)(raw, node.sourceRows?.[0] || {});
            }
            const Template = tpl as React.ComponentType<CellTemplateProps>;
            return <Template value={raw} field={field} row={node.sourceRows?.[0] || {}} formattedValue={formatted} />;
        }

        if (cellTemplate) {
            const tpl = cellTemplate;
            if (typeof tpl === 'function' && !(tpl as React.ComponentType<CellTemplateProps>).prototype?.isReactComponent && tpl.length === 2) {
                return (tpl as (value: unknown, row: Record<string, unknown>) => React.ReactNode)(raw, node.sourceRows?.[0] || {});
            }
            const Template = tpl as React.ComponentType<CellTemplateProps>;
            return <Template value={raw} field={field} row={node.sourceRows?.[0] || {}} formattedValue={formatted} />;
        }

        return formatted;
    };

    const maxRowHeaderDepth = config.rows.length;

    const renderColumnHeaders = (): React.ReactNode => {
        const headerLevels: ColumnNode[][] = [];
        const collectLevels = (nodes: ColumnNode[], level: number) => {
            if (!headerLevels[level]) headerLevels[level] = [];
            for (const n of nodes) {
                headerLevels[level].push(n);
                if (!n.isLeaf) collectLevels(n.children, level + 1);
            }
        };
        collectLevels(columnTree, 0);
        if (headerLevels.length === 0) return null;

        return headerLevels.map((level, idx) => (
            <tr key={idx} className="eui-pivot-header-row">
                {idx === 0 && (
                    <th className="eui-pivot-row-header-cell eui-pivot-corner" rowSpan={headerLevels.length} colSpan={maxRowHeaderDepth || 1}>
                        {config.rows.map((r, i) => {
                            if (headerTemplate) return <React.Fragment key={r}>{headerTemplate(r, r)}</React.Fragment>;
                            return (
                                <span key={r} className="eui-pivot-row-field-label">
                                    {r}{i < config.rows.length - 1 ? ' / ' : ''}
                                </span>
                            );
                        })}
                    </th>
                )}
                {level.map((col) => (
                    <th
                        key={col.key}
                        className={cn('eui-pivot-col-header', {
                            'eui-pivot-col-header-sortable': sortable && col.isLeaf && permissions.allowSort,
                            'eui-pivot-col-header-total': col.key === '__total__',
                        })}
                        colSpan={col.isLeaf ? 1 : col.span}
                        rowSpan={col.isLeaf ? headerLevels.length - idx : 1}
                        onClick={sortable && col.isLeaf && permissions.allowSort ? () => handleSort(col.key) : undefined}
                    >
                        <div className="eui-pivot-col-header-content">
                            {headerTemplate ? headerTemplate(col.key, col.label) : <span>{col.label}</span>}
                            {sortable && col.isLeaf && currentSort?.field === col.key && (
                                <span className="eui-pivot-sort-icon">
                                    {currentSort.direction === 'asc' ? sortAscIcon : sortDescIcon}
                                </span>
                            )}
                        </div>
                    </th>
                ))}
            </tr>
        ));
    };

    const renderRow = (node: PivotNode, isTotal: boolean = false): React.ReactNode[] => {
        const rows: React.ReactNode[] = [];
        const expanded = isExpanded(node.key);
        const hasChildren = node.children.length > 0;
        const indentStyle: React.CSSProperties = { paddingLeft: `${(node.depth - 1) * 1.25 + 0.5}rem` };

        rows.push(
            <tr
                key={node.key}
                className={cn('eui-pivot-data-row', {
                    'eui-pivot-data-row-total': isTotal,
                    'eui-pivot-data-row-subtotal': !isTotal && hasChildren,
                    'eui-pivot-data-row-leaf': !hasChildren,
                    'eui-pivot-data-row-expanded': expanded,
                    'eui-pivot-data-row-editable': editable && node.isLeaf,
                })}
            >
                <td
                    className="eui-pivot-row-label-cell"
                    colSpan={isTotal ? maxRowHeaderDepth || 1 : 1}
                    style={!isTotal ? indentStyle : undefined}
                >
                    <div className="eui-pivot-row-label">
                        {hasChildren && permissions.allowExpandCollapse && (
                            <button
                                className="eui-pivot-expand-btn"
                                onClick={() => toggleExpand(node.key)}
                                type="button"
                                aria-label={expanded ? 'Collapse' : 'Expand'}
                                aria-expanded={expanded}
                            >
                                {expanded ? collapseIcon : expandIcon}
                            </button>
                        )}
                        <span className={cn({ 'eui-pivot-total-label': isTotal })}>
                            {rowHeaderTemplate ? rowHeaderTemplate(node.label, node.depth, node) : node.label}
                            {hasChildren && showSubTotals && !expanded && (
                                <span className="eui-pivot-row-count">({node.rowCount})</span>
                            )}
                        </span>
                    </div>
                </td>

                {!isTotal && maxRowHeaderDepth > 1 && node.depth < maxRowHeaderDepth &&
                    Array.from({ length: maxRowHeaderDepth - node.depth }, (_, i) => (
                        <td key={`pad-${i}`} className="eui-pivot-row-pad-cell" />
                    )).slice(0, maxRowHeaderDepth - 1)
                }

                {leafColumns.map((colKey) => {
                    const { raw, formatted } = getCellValue(node, colKey, config.values);
                    const isEditing = editingCell?.nodeKey === node.key && editingCell?.colKey === colKey;
                    const isTotalCell = isTotal || colKey.includes('__total');

                    const parts = colKey.split('__');
                    const fieldAgg = parts[0];
                    const underscoreIdx = fieldAgg.lastIndexOf('_');
                    const field = fieldAgg.substring(0, underscoreIdx);

                    const canEdit = editable && node.isLeaf && !isTotalCell && permissions.allowEdit;
                    const cellClickHandler = canEdit && editConfig.mode === 'click'
                        ? () => startEdit(node, colKey)
                        : undefined;
                    const cellDblClickHandler = canEdit && (editConfig.mode === 'doubleClick' || editConfig.mode === 'inline')
                        ? () => startEdit(node, colKey)
                        : undefined;

                    return (
                        <td
                            key={colKey}
                            className={cn('eui-pivot-value-cell', {
                                'eui-pivot-total-cell': isTotalCell,
                                'eui-pivot-cell-editable': canEdit,
                                'eui-pivot-cell-editing': isEditing,
                                'eui-pivot-cell-edit-highlight': isEditing && editConfig.highlightOnEdit,
                            })}
                            onClick={cellClickHandler}
                            onDoubleClick={cellDblClickHandler}
                        >
                            {isEditing ? (
                                <PivotCellEditor
                                    value={raw}
                                    field={field}
                                    row={node.sourceRows?.[0] || {}}
                                    fieldDef={fieldDefMap[field]}
                                    dataType={fieldTypeMap[field] || 'string'}
                                    customEditor={pluginEditors[field]}
                                    onCommit={(newVal) => handleCellEditCommit(node, field, newVal)}
                                    onCancel={() => setEditingCell(null)}
                                />
                            ) : (
                                <div className="eui-pivot-cell-content">
                                    {renderCellContent(node, colKey, raw, formatted)}
                                    {canEdit && editConfig.showEditIcon && (
                                        <button
                                            className={cn('eui-pivot-cell-edit-icon', `eui-pivot-cell-edit-icon-${editConfig.editIconPosition}`)}
                                            onClick={(e) => { e.stopPropagation(); startEdit(node, colKey); }}
                                            type="button"
                                            aria-label="Edit cell"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </td>
                    );
                })}
            </tr>,
        );

        if (hasChildren && expanded) {
            const sortedChildren = sortPivotNodes(node.children, currentSort);
            for (const child of sortedChildren) {
                rows.push(...renderRow(child, false));
            }

            if (showSubTotals && node.depth > 0) {
                rows.push(
                    <tr key={`${node.key}__subtotal`} className="eui-pivot-data-row eui-pivot-data-row-subtotal-sum">
                        <td
                            className="eui-pivot-row-label-cell"
                            colSpan={maxRowHeaderDepth || 1}
                            style={{ paddingLeft: `${(node.depth - 1) * 1.25 + 0.5}rem` }}
                        >
                            <span className="eui-pivot-subtotal-label">Subtotal: {node.label}</span>
                        </td>
                        {leafColumns.map((colKey) => {
                            const { formatted } = getCellValue(node, colKey, config.values);
                            return (
                                <td key={colKey} className="eui-pivot-value-cell eui-pivot-subtotal-cell">
                                    {formatted}
                                </td>
                            );
                        })}
                    </tr>,
                );
            }
        }

        return rows;
    };

    if (data.length === 0 && !loading) {
        return (
            <div className={cn('eui-pivot-table-empty', className)}>
                <p>{emptyMessage}</p>
            </div>
        );
    }

    const sortedTopLevel = sortPivotNodes(pivotRoot.children, currentSort);
    const showPanel = showConfigPanel && permissions.allowConfigPanel;

    return (
        <DragDropProvider>
        <div
            className={cn(
                'eui-pivot-table-container',
                `eui-pivot-config-${configPanelPosition}`,
                { 'eui-pivot-table-has-panel': showPanel && !configPanelCollapsed },
                className,
            )}
        >
            {showPanel && (
                <PivotConfigPanel
                    data={data as Record<string, unknown>[]}
                    config={config}
                    fieldDefinitions={fieldDefinitions}
                    plugins={plugins}
                    disabledFunctions={disabledFunctions}
                    onConfigChange={handleConfigChange}
                    collapsed={configPanelCollapsible ? configPanelCollapsed : false}
                    onToggleCollapse={configPanelCollapsible ? () => setConfigPanelCollapsed((p) => !p) : undefined}
                    permissions={{
                        allowDragDrop: permissions.allowDragDrop,
                        allowAddRows: permissions.allowAddRows,
                        allowAddColumns: permissions.allowAddColumns,
                        allowAddValues: permissions.allowAddValues,
                        allowAddFilters: permissions.allowAddFilters,
                        allowRemoveFields: permissions.allowRemoveFields,
                        allowChangeAggregation: permissions.allowChangeAggregation,
                    }}
                />
            )}

            <div
                className={cn('eui-pivot-table', {
                    'eui-pivot-table-striped': striped,
                    'eui-pivot-table-bordered': bordered,
                    'eui-pivot-table-compact': compact,
                })}
            >
                {showToolbar && (
                    <div className="eui-pivot-toolbar">
                        <button className="eui-pivot-toolbar-btn" onClick={expandAllRows} type="button">
                            Expand All
                        </button>
                        <button className="eui-pivot-toolbar-btn" onClick={collapseAllRows} type="button">
                            Collapse All
                        </button>
                        {exportable && (
                            <>
                                <button className="eui-pivot-toolbar-btn" onClick={() => handleExport('csv')} type="button">
                                    Export CSV
                                </button>
                                <button className="eui-pivot-toolbar-btn" onClick={() => handleExport('json')} type="button">
                                    Export JSON
                                </button>
                            </>
                        )}
                        <span className="eui-pivot-toolbar-info">
                            {data.length} records
                            {editable && <span className="eui-pivot-toolbar-edit-hint"> | Double-click to edit</span>}
                        </span>
                    </div>
                )}

                <div className="eui-pivot-table-scroll" style={height ? { maxHeight: height } : undefined}>
                    {loading ? (
                        <div className="eui-pivot-loading">
                            <div className="eui-pivot-loading-spinner" />
                            <span>Loading...</span>
                        </div>
                    ) : (
                        <table className="eui-pivot-table-element">
                            <thead>{renderColumnHeaders()}</thead>
                            <tbody>
                                {sortedTopLevel.map((node) => renderRow(node, false))}
                                {showGrandTotal && (
                                    renderRow({
                                        ...pivotRoot,
                                        key: '__grand_total__',
                                        label: 'Grand Total',
                                        depth: 1,
                                        children: [],
                                        isLeaf: true,
                                    }, true)
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
        </DragDropProvider>
    );
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export { PivotTable };
export type {
    PivotTableProps, PivotConfig, PivotField, PivotFilter, PivotSort,
    AggregateFunction, BuiltInAggregateFunction,
    FieldDefinition, CellEditorProps, CellTemplateProps,
    CustomAggregatePlugin, PivotPlugin, PivotPermissions,
    PivotNode, ColumnNode, PivotZone,
} from './pivot-table-types';
