import classNames from 'classnames';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Sortable } from '../drag-drop';
import type { SortableChangeEvent } from '../drag-drop';
import { useKanban } from './KanbanContext';
import KanbanCard from './KanbanCard';
import KanbanColumnHeader from './KanbanColumnHeader';
import { KanbanCardData, KanbanColumnProps } from './kanban-types';
import { getCardsForColumn, isColumnOverLimit } from './kanban-utils';

const kanbanItemType = 'kanban-card';

function KanbanColumn({ column, cards, index, isCollapsed }: KanbanColumnProps) {
    const { props } = useKanban();
    const {
        draggable = true,
        allowAddCard,
        columnFooterTemplate,
        emptyColumnTemplate,
        maxColumnHeight,
        onCardMove,
        onCardReorder,
        onCardCreate,
    } = props;

    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const addInputRef = useRef<HTMLInputElement>(null);

    const columnCards = useMemo(
        () => getCardsForColumn(cards, column.id),
        [cards, column.id],
    );

    const overLimit = isColumnOverLimit(column, columnCards.length);

    const handleSortChange = useCallback(
        (newItems: KanbanCardData[], _args?: any, event?: SortableChangeEvent) => {
            if (!event) return;

            const { source, target } = event;

            if (source && target) {
                if (source.containerId !== target.containerId) {
                    const fromColumnId = source.args?.columnId ?? source.item?.columnId;
                    onCardMove?.({
                        cardId: source.item.id,
                        card: source.item,
                        fromColumnId,
                        toColumnId: column.id,
                        fromIndex: source.index,
                        toIndex: target.index,
                    });
                } else {
                    onCardReorder?.({
                        columnId: column.id,
                        cards: newItems,
                    });
                }
            } else if (event.removed) {
                onCardReorder?.({
                    columnId: column.id,
                    cards: newItems,
                });
            }
        },
        [column.id, onCardMove, onCardReorder],
    );

    const handleStartAddCard = useCallback(() => {
        setIsAddingCard(true);
        setNewCardTitle('');
        setTimeout(() => addInputRef.current?.focus(), 0);
    }, []);

    const handleAddCard = useCallback(() => {
        const title = newCardTitle.trim();
        if (title) {
            onCardCreate?.({ columnId: column.id, title });
        }
        setNewCardTitle('');
        setIsAddingCard(false);
    }, [newCardTitle, column.id, onCardCreate]);

    const handleAddCardKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleAddCard();
            } else if (e.key === 'Escape') {
                setIsAddingCard(false);
                setNewCardTitle('');
            }
        },
        [handleAddCard],
    );

    if (isCollapsed) {
        return (
            <div
                className="eui-kanban-column eui-kanban-column-collapsed"
                role="region"
                aria-label={`${column.title} column (collapsed)`}
                data-column-id={column.id}
            >
                <KanbanColumnHeader column={column} cardCount={columnCards.length} isCollapsed />
            </div>
        );
    }

    return (
        <div
            className={classNames('eui-kanban-column', {
                'eui-kanban-column-over-limit': overLimit,
                'eui-kanban-column-locked': column.locked,
            })}
            role="region"
            aria-label={`${column.title} column, ${columnCards.length} cards`}
            data-column-id={column.id}
            data-column-index={index}
        >
            <KanbanColumnHeader column={column} cardCount={columnCards.length} isCollapsed={false} />

            <div
                className="eui-kanban-column-body"
                style={maxColumnHeight ? { maxHeight: maxColumnHeight } : undefined}
            >
                {draggable && !column.locked ? (
                    <Sortable
                        items={columnCards}
                        itemType={kanbanItemType}
                        accept={kanbanItemType}
                        args={{ columnId: column.id }}
                        className="eui-kanban-sortable"
                        onChange={handleSortChange}
                        showPlaceholder
                        placeholder={
                            columnCards.length === 0 && emptyColumnTemplate ? (
                                emptyColumnTemplate(column)
                            ) : (
                                <div className="eui-kanban-drop-placeholder" role="presentation">
                                    Drop here
                                </div>
                            )
                        }
                    >
                        {(card, idx) => (
                            <KanbanCard key={card.id} card={card} column={column} index={idx} />
                        )}
                    </Sortable>
                ) : (
                    <div className="eui-kanban-card-list">
                        {columnCards.length === 0 && emptyColumnTemplate ? (
                            emptyColumnTemplate(column)
                        ) : columnCards.length === 0 ? (
                            <div className="eui-kanban-empty">No cards</div>
                        ) : (
                            columnCards.map((card, idx) => (
                                <KanbanCard key={card.id} card={card} column={column} index={idx} />
                            ))
                        )}
                    </div>
                )}
            </div>

            {allowAddCard && !column.locked && (
                <div className="eui-kanban-column-footer">
                    {isAddingCard ? (
                        <div className="eui-kanban-add-card-form">
                            <input
                                ref={addInputRef}
                                className="eui-kanban-add-card-input"
                                value={newCardTitle}
                                onChange={(e) => setNewCardTitle(e.target.value)}
                                onKeyDown={handleAddCardKeyDown}
                                onBlur={handleAddCard}
                                placeholder="Enter card title..."
                                aria-label="New card title"
                            />
                        </div>
                    ) : (
                        <button
                            className="eui-kanban-add-card-btn"
                            onClick={handleStartAddCard}
                            type="button"
                            aria-label={`Add card to ${column.title}`}
                        >
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" aria-hidden="true">
                                <path d="M8 3v10M3 8h10" />
                            </svg>
                            Add card
                        </button>
                    )}
                </div>
            )}

            {columnFooterTemplate && (
                <div className="eui-kanban-column-custom-footer">
                    {columnFooterTemplate(column, columnCards)}
                </div>
            )}
        </div>
    );
}

export default KanbanColumn;
