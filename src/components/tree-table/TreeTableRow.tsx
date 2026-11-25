import React, { memo } from 'react';

import cn from 'classnames';

import { ChevronRightIcon, GripVerticalIcon, LoadingIcon } from '../../assets/icons';
import { Checkbox } from '../Checkbox';
import type { FlatRow } from './tree-table-data';
import type { EditingCell, RowCheckState, RowConfig } from './tree-table-internal';
import type { TreeTableCellContext, TreeTableDropPosition, TreeTableRowContext, TreeTableRowData } from './tree-table-types';
import { formatAggregate, getCellText, getCellValue } from './tree-table-utils';
import { TreeTableCellEditor } from './TreeTableCellEditor';
import type { ResolvedColumn } from './useTreeTableColumns';

interface TreeTableRowProps<T extends TreeTableRowData> {
    item: FlatRow<T>;
    index: number;
    height: number;
    guides: string;
    selected: boolean;
    checkState: RowCheckState;
    focusColumn: number;
    tabbable: boolean;
    editing: EditingCell | null;
    dropPosition: TreeTableDropPosition | null;
    config: RowConfig<T>;
}

const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlight = (text: string, terms: string[] | undefined): React.ReactNode => {
    if (!terms || !terms.length || !text) return text;
    const pattern = new RegExp(`(${terms.map(escapePattern).join('|')})`, 'gi');
    const parts = text.split(pattern);
    if (parts.length === 1) return text;
    const lowered = new Set(terms.map((term) => term.toLowerCase()));
    return parts.map((part, index) =>
        lowered.has(part.toLowerCase()) ? (
            <mark key={index} className="eui-tree-table-mark">
                {part}
            </mark>
        ) : (
            part
        ),
    );
};

const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

function Guides({ level, guides, isLast, indent, show }: { level: number; guides: string; isLast: boolean; indent: number; show: boolean }) {
    if (!level) return null;
    const style = { width: level * indent };
    if (!show) return <span className="eui-tree-table-indent" style={style} aria-hidden="true" />;
    const lines: React.ReactNode[] = [];
    for (let column = 0; column < level; column += 1) {
        const isOwn = column === level - 1;
        if (!isOwn && guides[column + 1] !== '1') continue;
        lines.push(
            <span
                key={column}
                className={cn('eui-tree-table-guide', {
                    'eui-tree-table-guide-pass': !isOwn,
                    'eui-tree-table-guide-elbow': isOwn,
                    'eui-tree-table-guide-last': isOwn && isLast,
                })}
                style={{ left: column * indent + indent / 2 }}
            />,
        );
    }
    return (
        <span className="eui-tree-table-indent" style={style} aria-hidden="true">
            {lines}
        </span>
    );
}

function TreeTableRowInner<T extends TreeTableRowData>({
    item,
    index,
    height,
    guides,
    selected,
    checkState,
    focusColumn,
    tabbable,
    editing,
    dropPosition,
    config,
}: TreeTableRowProps<T>) {
    const { row, key, level, hasChildren, expanded, loading } = item;
    const { columns, handlers, labels, selectionMode } = config;
    const disabled = config.isRowDisabled(row);
    const selectable = !disabled && config.isRowSelectable(row);
    const expanderColumn = columns.find((entry) => entry.key === config.expanderKey) ?? columns[0];
    const rowLabel = config.rowLabel ? config.rowLabel(row) : expanderColumn ? getCellText(row, expanderColumn.column) : String(key);

    const rowContext: TreeTableRowContext<T> = {
        row,
        rowKey: key,
        rowIndex: index,
        level,
        parentKey: item.parentKey,
        hasChildren,
        expanded,
        loading,
        selected: selectionMode === 'checkbox' ? checkState === 'all' : selected,
        disabled,
        toggle: () => handlers.toggle(index),
    };

    const isSelected = rowContext.selected;

    const renderCellContent = (entry: ResolvedColumn<T>) => {
        const { column } = entry;
        const aggregated = Boolean(column.aggregate) && hasChildren && column.aggregateParents !== false;
        const value = aggregated ? config.aggregate(row, column) : getCellValue(row, column);
        if (editing && editing.columnKey === entry.key) {
            return (
                <TreeTableCellEditor
                    row={row}
                    rowKey={key}
                    column={column}
                    value={value}
                    error={editing.error}
                    ariaLabel={`${labels.editCell} ${typeof column.title === 'string' ? column.title : column.headerAriaLabel ?? column.key}`}
                    onCommit={(next) => handlers.commitEdit(index, entry.key, next)}
                    onCancel={handlers.cancelEdit}
                />
            );
        }
        if (column.cell) {
            const context: TreeTableCellContext<T> = { ...rowContext, value, aggregated, column, filterText: config.filterText };
            return column.cell(context);
        }
        const text = aggregated && !column.format ? formatAggregate(value as number | null) : getCellText(row, column, value);
        return config.highlightMatches ? highlight(text, config.highlightTerms.get(entry.key)) : text;
    };

    const renderExpander = () => (
        <>
            <Guides level={level} guides={guides} isLast={item.isLast} indent={config.indent} show={config.showGuides} />
            {hasChildren ? (
                <button
                    type="button"
                    tabIndex={-1}
                    className={cn('eui-tree-table-toggle', { 'eui-tree-table-toggle-expanded': expanded })}
                    aria-label={`${expanded ? labels.collapse : labels.expand} ${rowLabel}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        handlers.toggle(index);
                    }}
                    onDoubleClick={stopPropagation}
                >
                    {loading ? (
                        <LoadingIcon className="eui-tree-table-spinner" aria-hidden="true" />
                    ) : expanded && config.collapseIcon ? (
                        config.collapseIcon
                    ) : !expanded && config.expandIcon ? (
                        config.expandIcon
                    ) : (
                        <ChevronRightIcon className="eui-tree-table-toggle-icon" aria-hidden="true" />
                    )}
                </button>
            ) : (
                <span className="eui-tree-table-toggle-spacer" aria-hidden="true" />
            )}
            {selectionMode === 'checkbox' && (
                <span className="eui-tree-table-check" onClick={stopPropagation} onDoubleClick={stopPropagation}>
                    <Checkbox
                        size="sm"
                        checked={checkState === 'all'}
                        indeterminate={checkState === 'some'}
                        disabled={!selectable}
                        tabIndex={-1}
                        aria-label={`${labels.selectRow} ${rowLabel}`}
                        onChange={() => handlers.check(index)}
                    />
                </span>
            )}
            {config.rowIcon && (
                <span className="eui-tree-table-row-icon" aria-hidden="true">
                    {config.rowIcon(row, { expanded, hasChildren, level })}
                </span>
            )}
        </>
    );

    return (
        <div
            role="row"
            className={cn(
                'eui-tree-table-row',
                {
                    'eui-tree-table-row-selected': isSelected,
                    'eui-tree-table-row-disabled': disabled,
                    'eui-tree-table-row-odd': index % 2 === 1,
                    'eui-tree-table-row-parent': hasChildren,
                    'eui-tree-table-row-focused': focusColumn === -1,
                    'eui-tree-table-row-draggable': config.rowReorder && !disabled,
                    [`eui-tree-table-drop-${dropPosition}`]: dropPosition,
                },
                config.rowClassName?.(row, rowContext),
            )}
            style={{ height }}
            aria-rowindex={config.headerRowCount + index + 1}
            aria-level={level + 1}
            aria-setsize={item.setSize}
            aria-posinset={item.posInSet}
            aria-expanded={hasChildren ? expanded : undefined}
            aria-selected={selectionMode !== 'none' && selectable ? isSelected : undefined}
            aria-disabled={disabled || undefined}
            aria-busy={loading || undefined}
            tabIndex={tabbable && focusColumn === -1 ? 0 : -1}
            data-tt-index={index}
            draggable={config.rowReorder && !disabled && !editing}
            onClick={(event) => handlers.rowClick(index, event)}
            onDoubleClick={(event) => handlers.rowDoubleClick(index, event)}
            onContextMenu={(event) => handlers.rowContextMenu(index, event)}
            onDragStart={config.rowReorder ? (event) => handlers.dragStart(index, event) : undefined}
            onDragOver={config.rowReorder ? (event) => handlers.dragOver(index, event) : undefined}
            onDragLeave={config.rowReorder ? (event) => handlers.dragLeave(index, event) : undefined}
            onDrop={config.rowReorder ? (event) => handlers.drop(index, event) : undefined}
            onDragEnd={config.rowReorder ? handlers.dragEnd : undefined}
        >
            {columns.map((entry) => {
                const { column } = entry;
                const isExpander = entry === expanderColumn;
                const isEditing = editing?.columnKey === entry.key;
                const extra = typeof column.cellClassName === 'function' ? column.cellClassName(row) : column.cellClassName;
                const title =
                    column.showTitle !== false && column.ellipsis !== false && !column.cell && !isEditing
                        ? getCellText(row, column) || undefined
                        : undefined;
                return (
                    <div
                        key={entry.key}
                        role="gridcell"
                        aria-colindex={entry.index + 1}
                        tabIndex={tabbable && focusColumn === entry.index ? 0 : -1}
                        data-tt-col={entry.index}
                        title={title}
                        className={cn(
                            'eui-tree-table-cell',
                            `eui-tree-table-align-${column.align ?? 'left'}`,
                            {
                                'eui-tree-table-cell-expander': isExpander,
                                'eui-tree-table-cell-wrap': column.wrap,
                                'eui-tree-table-cell-focused': focusColumn === entry.index,
                                'eui-tree-table-cell-editing': isEditing,
                                'eui-tree-table-cell-frozen': entry.frozen,
                                'eui-tree-table-cell-frozen-left': entry.frozen === 'left',
                                'eui-tree-table-cell-frozen-right': entry.frozen === 'right',
                                'eui-tree-table-cell-frozen-edge-left': entry.isLastLeftFrozen,
                                'eui-tree-table-cell-frozen-edge-right': entry.isFirstRightFrozen,
                            },
                            column.className,
                            extra,
                        )}
                        style={entry.stickyStyle}
                        onClick={(event) => handlers.cellClick(index, entry.index, event)}
                        onDoubleClick={() => handlers.cellDoubleClick(index, entry.index)}
                    >
                        {isExpander ? (
                            <div className="eui-tree-table-expander">
                                {config.rowReorder && !disabled && (
                                    <span className="eui-tree-table-grip" title={labels.dragRow} aria-hidden="true">
                                        <GripVerticalIcon />
                                    </span>
                                )}
                                {renderExpander()}
                                <div className="eui-tree-table-cell-content">{renderCellContent(entry)}</div>
                            </div>
                        ) : (
                            <div className="eui-tree-table-cell-content">{renderCellContent(entry)}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export const TreeTableRow = memo(TreeTableRowInner) as <T extends TreeTableRowData>(props: TreeTableRowProps<T>) => React.ReactElement;
