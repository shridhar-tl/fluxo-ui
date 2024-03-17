import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useKanban } from './KanbanContext';
import { KanbanColumnData } from './kanban-types';
import { isColumnOverLimit } from './kanban-utils';

interface KanbanColumnHeaderProps {
    column: KanbanColumnData;
    cardCount: number;
    isCollapsed: boolean;
}

function KanbanColumnHeader({ column, cardCount, isCollapsed }: KanbanColumnHeaderProps) {
    const { props, toggleCollapse, editingColumnId, setEditingColumnId } = useKanban();
    const {
        columnHeaderTemplate,
        allowCollapse,
        allowEditColumn,
        allowDeleteColumn,
        showCardCount,
        showColumnLimit,
        onColumnDelete,
        onColumnUpdate,
    } = props;

    const [editTitle, setEditTitle] = useState(column.title);
    const inputRef = useRef<HTMLInputElement>(null);
    const isEditing = editingColumnId === column.id;
    const overLimit = isColumnOverLimit(column, cardCount);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = useCallback(() => {
        if (!allowEditColumn || column.locked) return;
        setEditTitle(column.title);
        setEditingColumnId(column.id);
    }, [allowEditColumn, column.locked, column.title, column.id, setEditingColumnId]);

    const handleSaveEdit = useCallback(() => {
        const trimmed = editTitle.trim();
        if (trimmed && trimmed !== column.title) {
            onColumnUpdate?.({ column, field: 'title', value: trimmed });
        }
        setEditingColumnId(null);
    }, [editTitle, column, onColumnUpdate, setEditingColumnId]);

    const handleEditKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleSaveEdit();
            } else if (e.key === 'Escape') {
                setEditingColumnId(null);
            }
        },
        [handleSaveEdit, setEditingColumnId],
    );

    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onColumnDelete?.({ column });
        },
        [column, onColumnDelete],
    );

    const handleCollapse = useCallback(() => {
        toggleCollapse(column.id);
    }, [column.id, toggleCollapse]);

    if (isCollapsed) {
        return (
            <div
                className="eui-kanban-column-header eui-kanban-column-header-collapsed"
                onClick={handleCollapse}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCollapse(); }}
                role="button"
                tabIndex={0}
                aria-label={`Expand ${column.title} column`}
                title={`Expand ${column.title}`}
            >
                <div className="eui-kanban-column-header-collapsed-content">
                    {column.color && (
                        <span className="eui-kanban-column-color" style={{ backgroundColor: column.color }} aria-hidden="true" />
                    )}
                    <span className="eui-kanban-column-title-collapsed">{column.title}</span>
                    {showCardCount && <span className="eui-kanban-column-count">{cardCount}</span>}
                </div>
            </div>
        );
    }

    if (columnHeaderTemplate) {
        return (
            <div className="eui-kanban-column-header" role="heading" aria-level={3}>
                {columnHeaderTemplate(column, cardCount)}
            </div>
        );
    }

    return (
        <div
            className={classNames('eui-kanban-column-header', {
                'eui-kanban-column-over-limit': overLimit,
            })}
            role="heading"
            aria-level={3}
        >
            <div className="eui-kanban-column-header-left">
                {column.color && (
                    <span className="eui-kanban-column-color" style={{ backgroundColor: column.color }} aria-hidden="true" />
                )}
                {column.icon && <span className="eui-kanban-column-icon" aria-hidden="true">{column.icon}</span>}

                {isEditing ? (
                    <input
                        ref={inputRef}
                        className="eui-kanban-column-title-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleEditKeyDown}
                        aria-label="Edit column title"
                    />
                ) : (
                    <span
                        className="eui-kanban-column-title"
                        onDoubleClick={handleStartEdit}
                        title={allowEditColumn && !column.locked ? 'Double-click to edit' : column.title}
                    >
                        {column.title}
                    </span>
                )}

                {showCardCount && (
                    <span
                        className={classNames('eui-kanban-column-count', {
                            'eui-kanban-column-count-over': overLimit,
                        })}
                        aria-label={`${cardCount} cards${column.limit ? ` of ${column.limit} limit` : ''}`}
                    >
                        {cardCount}
                        {showColumnLimit && column.limit ? `/${column.limit}` : ''}
                    </span>
                )}
            </div>

            <div className="eui-kanban-column-header-right">
                {allowDeleteColumn && !column.locked && (
                    <button
                        className="eui-kanban-column-action"
                        onClick={handleDelete}
                        aria-label={`Delete ${column.title} column`}
                        title="Delete column"
                        type="button"
                    >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" aria-hidden="true">
                            <path d="M3 5h10M5.5 5V3.5a1 1 0 011-1h3a1 1 0 011 1V5M6.5 7.5v4M9.5 7.5v4M4.5 5l.5 8.5a1 1 0 001 1h4a1 1 0 001-1L11.5 5" />
                        </svg>
                    </button>
                )}
                {allowCollapse && (
                    <button
                        className="eui-kanban-column-action"
                        onClick={handleCollapse}
                        aria-label={`Collapse ${column.title} column`}
                        title="Collapse column"
                        type="button"
                    >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" aria-hidden="true">
                            <path d="M4 6l4 4 4-4" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

export default KanbanColumnHeader;
