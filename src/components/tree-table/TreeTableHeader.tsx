import React, { memo, useEffect, useRef, useState } from 'react';

import cn from 'classnames';

import { ArrowDownIcon, ArrowUpIcon, SortBothIcon } from '../../assets/icons';
import { Checkbox } from '../Checkbox';
import { TextInput } from '../TextInput';
import type { RowCheckState } from './tree-table-internal';
import type { TreeTableLabels, TreeTableRowData, TreeTableSort } from './tree-table-types';
import type { ColumnLayout, ResolvedColumn } from './useTreeTableColumns';

interface SelectAllState {
    state: RowCheckState;
    onToggle: () => void;
}

interface TreeTableHeaderProps<T extends TreeTableRowData> {
    layout: ColumnLayout<T>;
    expanderKey: string;
    sort: TreeTableSort[];
    labels: TreeTableLabels;
    resizable: boolean;
    reorderable: boolean;
    showFilterRow: boolean;
    filters: Record<string, string>;
    filterDebounce: number;
    selectAll: SelectAllState | null;
    onSort: (key: string, additive: boolean) => void;
    onResize: (key: string, width: number) => void;
    onResizeEnd: (key: string, width: number) => void;
    onReorder: (sourceKey: string, targetKey: string, after: boolean) => void;
    onMoveColumn: (key: string, direction: -1 | 1) => void;
    onFilterChange: (key: string, value: string) => void;
}

const titleText = <T extends TreeTableRowData>(entry: ResolvedColumn<T>): string => {
    if (entry.column.headerAriaLabel) return entry.column.headerAriaLabel;
    return typeof entry.column.title === 'string' ? entry.column.title : entry.key;
};

const cellClasses = <T extends TreeTableRowData>(entry: ResolvedColumn<T>, extra?: string) =>
    cn(
        'eui-tree-table-header-cell',
        {
            'eui-tree-table-cell-frozen': entry.frozen,
            'eui-tree-table-cell-frozen-left': entry.frozen === 'left',
            'eui-tree-table-cell-frozen-right': entry.frozen === 'right',
            'eui-tree-table-cell-frozen-edge-left': entry.isLastLeftFrozen,
            'eui-tree-table-cell-frozen-edge-right': entry.isFirstRightFrozen,
        },
        extra,
    );

interface ResizeHandleProps {
    columnKey: string;
    label: string;
    minWidth: number;
    maxWidth: number;
    onResize: (key: string, width: number) => void;
    onResizeEnd: (key: string, width: number) => void;
}

function ResizeHandle({ columnKey, label, minWidth, maxWidth, onResize, onResizeEnd }: ResizeHandleProps) {
    const dragRef = useRef<{ startX: number; startWidth: number; width: number; frame: number } | null>(null);
    const [current, setCurrent] = useState<number | null>(null);

    const measure = (element: HTMLElement) => element.parentElement?.getBoundingClientRect().width ?? minWidth;
    const clamp = (value: number) => Math.round(Math.min(Math.max(value, minWidth), maxWidth));

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        const startWidth = measure(event.currentTarget);
        dragRef.current = { startX: event.clientX, startWidth, width: startWidth, frame: 0 };
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag) return;
        drag.width = clamp(drag.startWidth + event.clientX - drag.startX);
        if (drag.frame) return;
        drag.frame = requestAnimationFrame(() => {
            if (!dragRef.current) return;
            dragRef.current.frame = 0;
            onResize(columnKey, dragRef.current.width);
            setCurrent(dragRef.current.width);
        });
    };

    const finish = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag) return;
        if (drag.frame) cancelAnimationFrame(drag.frame);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        dragRef.current = null;
        onResize(columnKey, drag.width);
        onResizeEnd(columnKey, drag.width);
        setCurrent(drag.width);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        event.stopPropagation();
        const step = (event.shiftKey ? 50 : 10) * (event.key === 'ArrowLeft' ? -1 : 1);
        const next = clamp(measure(event.currentTarget) + step);
        onResize(columnKey, next);
        onResizeEnd(columnKey, next);
        setCurrent(next);
    };

    return (
        <div
            role="separator"
            aria-orientation="vertical"
            aria-label={label}
            aria-valuenow={current ?? undefined}
            aria-valuemin={minWidth}
            aria-valuemax={Number.isFinite(maxWidth) ? maxWidth : undefined}
            tabIndex={0}
            className="eui-tree-table-resizer"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finish}
            onPointerCancel={finish}
            onKeyDown={handleKeyDown}
            onClick={(event) => event.stopPropagation()}
            onDragStart={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
        />
    );
}

interface FilterCellProps<T extends TreeTableRowData> {
    entry: ResolvedColumn<T>;
    value: string;
    debounce: number;
    labels: TreeTableLabels;
    onChange: (key: string, value: string) => void;
}

function FilterCell<T extends TreeTableRowData>({ entry, value, debounce, labels, onChange }: FilterCellProps<T>) {
    const [draft, setDraft] = useState(value);
    const [synced, setSynced] = useState(value);

    if (value !== synced) {
        setSynced(value);
        setDraft(value);
    }

    useEffect(() => {
        if (draft === synced) return;
        const timer = setTimeout(() => onChange(entry.key, draft), debounce);
        return () => clearTimeout(timer);
    }, [draft]);

    const update = (next: string) => setDraft(next);

    const { column } = entry;
    const placeholder = column.filterPlaceholder ?? labels.filterPlaceholder;
    const ariaLabel = `${labels.filterBy} ${titleText(entry)}`;

    return (
        <div role="columnheader" aria-colindex={entry.index + 1} className={cellClasses(entry, 'eui-tree-table-filter-cell')} style={entry.stickyStyle}>
            {column.filter ? (
                column.filter({ column, value: draft, onChange: update, placeholder, ariaLabel })
            ) : column.filterable ? (
                <TextInput
                    size="sm"
                    value={draft}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                    clearable
                    onClear={() => update('')}
                    onChange={(event) => update(event.value)}
                />
            ) : null}
        </div>
    );
}

function TreeTableHeaderInner<T extends TreeTableRowData>({
    layout,
    expanderKey,
    sort,
    labels,
    resizable,
    reorderable,
    showFilterRow,
    filters,
    filterDebounce,
    selectAll,
    onSort,
    onResize,
    onResizeEnd,
    onReorder,
    onMoveColumn,
    onFilterChange,
}: TreeTableHeaderProps<T>) {
    const dragKeyRef = useRef<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{ key: string; after: boolean } | null>(null);
    const groupRows = layout.groups ? 1 : 0;

    const canReorder = (entry: ResolvedColumn<T>) => reorderable && !entry.frozen && entry.column.reorderable !== false;

    const handleReorderKey = (entry: ResolvedColumn<T>) => (event: React.KeyboardEvent) => {
        if (!canReorder(entry) || !event.altKey || !event.shiftKey) return;
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        onMoveColumn(entry.key, event.key === 'ArrowLeft' ? -1 : 1);
    };

    const renderTitle = (entry: ResolvedColumn<T>, sortIndex: number, direction: TreeTableSort['direction'] | null) => {
        const { column } = entry;
        if (column.header) return column.header({ column, sortDirection: direction, sortIndex });
        return column.title ?? column.key;
    };

    return (
        <>
            {layout.groups && (
                <div role="row" className="eui-tree-table-header-row eui-tree-table-group-row" aria-rowindex={1}>
                    {layout.groups.map((group) => {
                        const first = layout.columns[group.start];
                        return (
                            <div
                                key={`${group.label}-${group.start}`}
                                role="columnheader"
                                aria-colindex={group.start + 1}
                                aria-colspan={group.span}
                                className={cn(cellClasses(first, 'eui-tree-table-group-cell'), { 'eui-tree-table-group-empty': !group.label })}
                                style={{ ...first.stickyStyle, gridColumn: `${group.start + 1} / span ${group.span}` }}
                            >
                                {group.label}
                            </div>
                        );
                    })}
                </div>
            )}
            <div role="row" className="eui-tree-table-header-row" aria-rowindex={groupRows + 1}>
                {layout.columns.map((entry) => {
                    const { column } = entry;
                    const sortIndex = sort.findIndex((item) => item.key === entry.key);
                    const direction = sortIndex >= 0 ? sort[sortIndex].direction : null;
                    const ariaSort = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : column.sortable ? 'none' : undefined;
                    const label = titleText(entry);
                    const movable = canReorder(entry);
                    const isDrop = dropTarget?.key === entry.key;
                    const showSelectAll = selectAll && entry.key === expanderKey;
                    const SortGlyph = direction === 'asc' ? ArrowUpIcon : direction === 'desc' ? ArrowDownIcon : SortBothIcon;
                    return (
                        <div
                            key={entry.key}
                            role="columnheader"
                            aria-colindex={entry.index + 1}
                            aria-sort={ariaSort}
                            className={cellClasses(
                                entry,
                                cn(`eui-tree-table-align-${column.headerAlign ?? column.align ?? 'left'}`, column.headerClassName, {
                                    'eui-tree-table-header-sorted': direction,
                                    'eui-tree-table-header-movable': movable,
                                    'eui-tree-table-header-drop-before': isDrop && !dropTarget?.after,
                                    'eui-tree-table-header-drop-after': isDrop && dropTarget?.after,
                                }),
                            )}
                            style={entry.stickyStyle}
                            draggable={movable}
                            onDragStart={
                                movable
                                    ? (event) => {
                                          dragKeyRef.current = entry.key;
                                          event.dataTransfer.effectAllowed = 'move';
                                          event.dataTransfer.setData('text/plain', '');
                                      }
                                    : undefined
                            }
                            onDragOver={(event) => {
                                const source = dragKeyRef.current;
                                if (!source || !movable || source === entry.key) return;
                                event.preventDefault();
                                const rect = event.currentTarget.getBoundingClientRect();
                                const after = event.clientX > rect.left + rect.width / 2;
                                if (dropTarget?.key !== entry.key || dropTarget.after !== after) setDropTarget({ key: entry.key, after });
                            }}
                            onDragLeave={() => {
                                if (dropTarget?.key === entry.key) setDropTarget(null);
                            }}
                            onDrop={(event) => {
                                const source = dragKeyRef.current;
                                if (!source || !movable) return;
                                event.preventDefault();
                                const rect = event.currentTarget.getBoundingClientRect();
                                onReorder(source, entry.key, event.clientX > rect.left + rect.width / 2);
                                dragKeyRef.current = null;
                                setDropTarget(null);
                            }}
                            onDragEnd={() => {
                                dragKeyRef.current = null;
                                setDropTarget(null);
                            }}
                        >
                            <div className="eui-tree-table-header-content">
                                {showSelectAll && (
                                    <span className="eui-tree-table-check">
                                        <Checkbox
                                            size="sm"
                                            checked={selectAll.state === 'all'}
                                            indeterminate={selectAll.state === 'some'}
                                            aria-label={labels.selectAll}
                                            onChange={selectAll.onToggle}
                                        />
                                    </span>
                                )}
                                {column.sortable ? (
                                    <button
                                        type="button"
                                        className="eui-tree-table-sort-button"
                                        aria-label={`${label}, ${direction === 'asc' ? labels.sortAscending : direction === 'desc' ? labels.sortDescending : labels.sortNone}`}
                                        onClick={(event) => onSort(entry.key, event.shiftKey || event.ctrlKey || event.metaKey)}
                                        onKeyDown={handleReorderKey(entry)}
                                    >
                                        <span className="eui-tree-table-header-title">{renderTitle(entry, sortIndex, direction)}</span>
                                        <span className={cn('eui-tree-table-sort-icon', { 'eui-tree-table-sort-active': direction })} aria-hidden="true">
                                            <SortGlyph />
                                            {sort.length > 1 && sortIndex >= 0 && <span className="eui-tree-table-sort-index">{sortIndex + 1}</span>}
                                        </span>
                                    </button>
                                ) : (
                                    <span
                                        className="eui-tree-table-header-title"
                                        tabIndex={movable ? 0 : undefined}
                                        aria-label={movable ? label : undefined}
                                        onKeyDown={movable ? handleReorderKey(entry) : undefined}
                                    >
                                        {renderTitle(entry, sortIndex, direction)}
                                    </span>
                                )}
                            </div>
                            {resizable && column.resizable !== false && (
                                <ResizeHandle
                                    columnKey={entry.key}
                                    label={`${labels.resizeColumn} ${label}`}
                                    minWidth={column.minWidth ?? 48}
                                    maxWidth={column.maxWidth ?? Infinity}
                                    onResize={onResize}
                                    onResizeEnd={onResizeEnd}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {showFilterRow && (
                <div role="row" className="eui-tree-table-header-row eui-tree-table-filter-row" aria-rowindex={groupRows + 2}>
                    {layout.columns.map((entry) => (
                        <FilterCell
                            key={entry.key}
                            entry={entry}
                            value={filters[entry.key] ?? ''}
                            debounce={filterDebounce}
                            labels={labels}
                            onChange={onFilterChange}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

export const TreeTableHeader = memo(TreeTableHeaderInner) as <T extends TreeTableRowData>(props: TreeTableHeaderProps<T>) => React.ReactElement;
