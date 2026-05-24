import '../eui-base.scss';
import './KanbanBoard.scss';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sortable } from '../drag-drop';
import type { SortableChangeEvent } from '../drag-drop';
import KanbanContext from './KanbanContext';
import KanbanColumn from './KanbanColumn';
import {
    KanbanBoardProps,
    KanbanCardData,
    KanbanCardMoveEvent,
    KanbanCardReorderEvent,
    KanbanColumnData,
    KanbanColumnId,
    KanbanContextValue,
    KanbanSearchFilter,
} from './kanban-types';
import { filterCards } from './kanban-utils';

const columnItemType = 'kanban-column';

function KanbanBoard(props: KanbanBoardProps) {
    const {
        columns,
        cards,
        layout = 'horizontal',
        className,
        columnWidth,
        columnMinHeight,
        columnDraggable = false,
        allowAddColumn,
        showSearch,
        stickyColumnHeaders,
        onCardMove,
        onCardReorder,
        onColumnReorder,
        onColumnCreate,
        onSearchChange,
    } = props;

    const isControlled = !!(onCardMove || onCardReorder);
    const [internalCards, setInternalCards] = useState<KanbanCardData[]>(cards);

    useEffect(() => {
        setInternalCards(cards);
    }, [cards]);

    const activeCards = isControlled ? cards : internalCards;

    const handleInternalCardMove = useCallback(
        (event: KanbanCardMoveEvent) => {
            if (onCardMove) {
                onCardMove(event);
                return;
            }
            setInternalCards((prev) => {
                const withoutCard = prev.filter((c) => c.id !== event.cardId);
                const targetCards = withoutCard
                    .filter((c) => c.columnId === event.toColumnId)
                    .sort((a, b) => a.order - b.order);
                const otherCards = withoutCard.filter((c) => c.columnId !== event.toColumnId);
                const movedCard = { ...event.card, columnId: event.toColumnId, order: event.toIndex };
                targetCards.splice(event.toIndex, 0, movedCard);
                const reordered = targetCards.map((c, i) => ({ ...c, order: i }));
                return [...otherCards, ...reordered];
            });
        },
        [onCardMove],
    );

    const handleInternalCardReorder = useCallback(
        (event: KanbanCardReorderEvent) => {
            if (onCardReorder) {
                onCardReorder(event);
                return;
            }
            setInternalCards((prev) => {
                const other = prev.filter((c) => c.columnId !== event.columnId);
                const reordered = event.cards.map((c, i) => ({ ...c, order: i }));
                return [...other, ...reordered];
            });
        },
        [onCardReorder],
    );

    const [collapsedColumns, setCollapsedColumns] = useState<Set<KanbanColumnId>>(() => {
        const initial = new Set<KanbanColumnId>();
        columns.forEach((col) => {
            if (col.collapsed) initial.add(col.id);
        });
        return initial;
    });

    const [searchFilter, setSearchFilterState] = useState<KanbanSearchFilter>({});
    const [editingColumnId, setEditingColumnId] = useState<KanbanColumnId | null>(null);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const addColumnInputRef = useRef<HTMLInputElement>(null);

    const toggleCollapse = useCallback(
        (columnId: KanbanColumnId) => {
            setCollapsedColumns((prev) => {
                const next = new Set(prev);
                const newState = !next.has(columnId);
                if (newState) next.add(columnId);
                else next.delete(columnId);
                props.onColumnCollapse?.(columnId, newState);
                return next;
            });
        },
        [props.onColumnCollapse],
    );

    const setSearchFilter = useCallback(
        (filter: KanbanSearchFilter) => {
            setSearchFilterState(filter);
            onSearchChange?.(filter);
        },
        [onSearchChange],
    );

    const filteredCards = useMemo(
        () => filterCards(activeCards, searchFilter),
        [activeCards, searchFilter],
    );

    const internalProps = useMemo(
        () => ({
            ...props,
            onCardMove: handleInternalCardMove,
            onCardReorder: handleInternalCardReorder,
        }),
        [props, handleInternalCardMove, handleInternalCardReorder],
    );

    const contextValue: KanbanContextValue = useMemo(
        () => ({
            props: internalProps,
            collapsedColumns,
            toggleCollapse,
            searchFilter,
            setSearchFilter,
            editingColumnId,
            setEditingColumnId,
        }),
        [internalProps, collapsedColumns, toggleCollapse, searchFilter, setSearchFilter, editingColumnId],
    );

    const handleColumnReorder = useCallback(
        (newColumns: KanbanColumnData[], _args?: any, _event?: SortableChangeEvent) => {
            onColumnReorder?.({ columns: newColumns });
        },
        [onColumnReorder],
    );

    const handleStartAddColumn = useCallback(() => {
        setIsAddingColumn(true);
        setNewColumnTitle('');
        setTimeout(() => addColumnInputRef.current?.focus(), 0);
    }, []);

    const handleAddColumn = useCallback(() => {
        const title = newColumnTitle.trim();
        if (title) {
            onColumnCreate?.({ title });
        }
        setNewColumnTitle('');
        setIsAddingColumn(false);
    }, [newColumnTitle, onColumnCreate]);

    const handleAddColumnKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') handleAddColumn();
            else if (e.key === 'Escape') {
                setIsAddingColumn(false);
                setNewColumnTitle('');
            }
        },
        [handleAddColumn],
    );

    const handleSearchInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchFilter({ ...searchFilter, query: e.target.value || undefined });
        },
        [searchFilter, setSearchFilter],
    );

    const columnStyle = useMemo(() => {
        const style: React.CSSProperties = {};
        if (columnWidth) {
            style.width = typeof columnWidth === 'number' ? `${columnWidth}px` : columnWidth;
            style.minWidth = style.width;
            style.maxWidth = style.width;
        }
        if (columnMinHeight) {
            style.minHeight = typeof columnMinHeight === 'number' ? `${columnMinHeight}px` : columnMinHeight;
        }
        return style;
    }, [columnWidth, columnMinHeight]);

    const collapsedStyle = useMemo<React.CSSProperties>(() => ({
        width: '40px',
        minWidth: '40px',
        maxWidth: '40px',
        flexShrink: 0,
    }), []);

    const renderColumn = (col: KanbanColumnData, idx: number) => {
        const isCollapsed = collapsedColumns.has(col.id);
        return (
            <div
                key={col.id}
                className={classNames('eui-kanban-column-wrapper', {
                    'eui-kanban-column-wrapper-collapsed': isCollapsed,
                })}
                style={isCollapsed ? collapsedStyle : columnStyle}
            >
                <KanbanColumn
                    column={col}
                    cards={filteredCards}
                    index={idx}
                    isCollapsed={isCollapsed}
                />
            </div>
        );
    };

    return (
        <KanbanContext.Provider value={contextValue}>
            <div
                className={classNames(
                    'eui-kanban-board',
                    `eui-kanban-layout-${layout}`,
                    {
                        'eui-kanban-sticky-headers': stickyColumnHeaders,
                    },
                    className,
                )}
                role="region"
                aria-label="Kanban board"
            >
                {showSearch && (
                    <div className="eui-kanban-search" role="search">
                        <div className="eui-kanban-search-wrapper">
                            <svg className="eui-kanban-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" aria-hidden="true">
                                <circle cx="6.5" cy="6.5" r="4.5" />
                                <path d="M10 10l4 4" />
                            </svg>
                            <input
                                className="eui-kanban-search-input"
                                type="text"
                                placeholder="Search cards..."
                                value={searchFilter.query ?? ''}
                                onChange={handleSearchInput}
                                aria-label="Search kanban cards"
                            />
                            {searchFilter.query && (
                                <button
                                    className="eui-kanban-search-clear"
                                    onClick={() => setSearchFilter({ ...searchFilter, query: undefined })}
                                    aria-label="Clear search"
                                    type="button"
                                >
                                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12" aria-hidden="true">
                                        <path d="M4 4l8 8M12 4l-8 8" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="eui-kanban-columns">
                    {columnDraggable ? (
                        <Sortable
                            items={columns}
                            itemType={columnItemType}
                            accept={columnItemType}
                            className="eui-kanban-columns-sortable"
                            onChange={handleColumnReorder}
                        >
                            {(col, idx) => renderColumn(col, idx)}
                        </Sortable>
                    ) : (
                        columns.map((col, idx) => renderColumn(col, idx))
                    )}

                    {allowAddColumn && (
                        <div className="eui-kanban-column-wrapper eui-kanban-add-column-wrapper">
                            {isAddingColumn ? (
                                <div className="eui-kanban-add-column-form">
                                    <input
                                        ref={addColumnInputRef}
                                        className="eui-kanban-add-column-input"
                                        value={newColumnTitle}
                                        onChange={(e) => setNewColumnTitle(e.target.value)}
                                        onKeyDown={handleAddColumnKeyDown}
                                        onBlur={handleAddColumn}
                                        placeholder="Column title..."
                                        aria-label="New column title"
                                    />
                                </div>
                            ) : (
                                <button
                                    className="eui-kanban-add-column-btn"
                                    onClick={handleStartAddColumn}
                                    type="button"
                                    aria-label="Add new column"
                                >
                                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16" aria-hidden="true">
                                        <path d="M8 3v10M3 8h10" />
                                    </svg>
                                    Add Column
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </KanbanContext.Provider>
    );
}

export default KanbanBoard;
