import cn from 'classnames';
import React, { useCallback, useState } from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import type {
    KanbanCardData,
    KanbanCardMoveEvent,
    KanbanCardReorderEvent,
    KanbanCardCreateEvent,
    KanbanCardDeleteEvent,
    KanbanCardClickEvent,
    KanbanColumnData,
    KanbanColumnCreateEvent,
    KanbanColumnDeleteEvent,
    KanbanColumnUpdateEvent,
    KanbanColumnReorderEvent,
} from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicColumns, basicCards, getNextId } from './kanban-story-data';

const code = `const [cards, setCards] = useState<KanbanCardData[]>(initialCards);
const [columns, setColumns] = useState<KanbanColumnData[]>(initialColumns);

<KanbanBoard
  columns={columns}
  cards={cards}
  draggable
  columnDraggable
  allowAddCard
  allowAddColumn
  allowDeleteCard
  allowDeleteColumn
  allowEditColumn
  allowCollapse
  showCardCount
  showColumnLimit
  showSearch
  onCardMove={(e) => {
    setCards(prev => {
      const without = prev.filter(c => c.id !== e.cardId);
      const target = without
        .filter(c => c.columnId === e.toColumnId)
        .sort((a, b) => a.order - b.order);
      const others = without.filter(c => c.columnId !== e.toColumnId);
      const moved = { ...e.card, columnId: e.toColumnId, order: e.toIndex };
      target.splice(e.toIndex, 0, moved);
      return [...others, ...target.map((c, i) => ({ ...c, order: i }))];
    });
  }}
  onCardReorder={(e) => {
    setCards(prev => {
      const other = prev.filter(c => c.columnId !== e.columnId);
      return [...other, ...e.cards.map((c, i) => ({ ...c, order: i }))];
    });
  }}
  onCardCreate={(e) => {
    setCards(prev => [...prev, {
      id: \`new-\${Date.now()}\`,
      title: e.title,
      columnId: e.columnId,
      order: prev.filter(c => c.columnId === e.columnId).length,
    }]);
  }}
  onCardDelete={(e) => setCards(prev => prev.filter(c => c.id !== e.card.id))}
  onColumnCreate={(e) => setColumns(prev => [...prev, { id: \`col-\${Date.now()}\`, title: e.title }])}
  onColumnDelete={(e) => {
    setColumns(prev => prev.filter(c => c.id !== e.column.id));
    setCards(prev => prev.filter(c => c.columnId !== e.column.id));
  }}
  onColumnUpdate={(e) => setColumns(prev =>
    prev.map(c => c.id === e.column.id ? { ...c, [e.field]: e.value } : c)
  )}
  onColumnReorder={(e) => setColumns(e.columns)}
/>`;

const InteractiveBoard: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [interactiveCards, setInteractiveCards] = useState<KanbanCardData[]>(basicCards);
    const [interactiveColumns, setInteractiveColumns] = useState<KanbanColumnData[]>(basicColumns);
    const [lastEvent, setLastEvent] = useState('');

    const handleCardMove = useCallback((event: KanbanCardMoveEvent) => {
        setInteractiveCards((prev) => {
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
        setLastEvent(`Moved "${event.card.title}" to column "${event.toColumnId}"`);
    }, []);

    const handleCardReorder = useCallback((event: KanbanCardReorderEvent) => {
        setInteractiveCards((prev) => {
            const other = prev.filter((c) => c.columnId !== event.columnId);
            const reordered = event.cards.map((c, i) => ({ ...c, order: i }));
            return [...other, ...reordered];
        });
    }, []);

    const handleCardCreate = useCallback((event: KanbanCardCreateEvent) => {
        const newCard: KanbanCardData = {
            id: getNextId(),
            title: event.title,
            columnId: event.columnId,
            order: interactiveCards.filter((c) => c.columnId === event.columnId).length,
        };
        setInteractiveCards((prev) => [...prev, newCard]);
        setLastEvent(`Created card "${event.title}"`);
    }, [interactiveCards]);

    const handleCardDelete = useCallback((event: KanbanCardDeleteEvent) => {
        setInteractiveCards((prev) => prev.filter((c) => c.id !== event.card.id));
        setLastEvent(`Deleted card "${event.card.title}"`);
    }, []);

    const handleCardClick = useCallback((event: KanbanCardClickEvent) => {
        setLastEvent(`Clicked: "${event.card.title}"`);
    }, []);

    const handleColumnCreate = useCallback((event: KanbanColumnCreateEvent) => {
        const newCol: KanbanColumnData = { id: getNextId(), title: event.title };
        setInteractiveColumns((prev) => [...prev, newCol]);
        setLastEvent(`Created column "${event.title}"`);
    }, []);

    const handleColumnDelete = useCallback((event: KanbanColumnDeleteEvent) => {
        setInteractiveColumns((prev) => prev.filter((c) => c.id !== event.column.id));
        setInteractiveCards((prev) => prev.filter((c) => c.columnId !== event.column.id));
        setLastEvent(`Deleted column "${event.column.title}"`);
    }, []);

    const handleColumnUpdate = useCallback((event: KanbanColumnUpdateEvent) => {
        setInteractiveColumns((prev) =>
            prev.map((c) => (c.id === event.column.id ? { ...c, [event.field]: event.value } : c)),
        );
    }, []);

    const handleColumnReorder = useCallback((event: KanbanColumnReorderEvent) => {
        setInteractiveColumns(event.columns);
    }, []);

    return (
        <>
            <ComponentDemo title="Interactive Board" description="Full interactive demo: drag cards, add/delete cards and columns, edit column titles, reorder columns." centered={false}>
                <div className="space-y-3">
                    <KanbanBoard
                        columns={interactiveColumns}
                        cards={interactiveCards}
                        draggable
                        columnDraggable
                        allowAddCard
                        allowAddColumn
                        allowDeleteCard
                        allowDeleteColumn
                        allowEditColumn
                        allowCollapse
                        showCardCount
                        showColumnLimit
                        showSearch
                        onCardMove={handleCardMove}
                        onCardReorder={handleCardReorder}
                        onCardCreate={handleCardCreate}
                        onCardDelete={handleCardDelete}
                        onCardClick={handleCardClick}
                        onColumnCreate={handleColumnCreate}
                        onColumnDelete={handleColumnDelete}
                        onColumnUpdate={handleColumnUpdate}
                        onColumnReorder={handleColumnReorder}
                    />
                    {lastEvent && (
                        <div className={cn('text-sm px-4 py-2 rounded border', {
                            'border-blue-800 bg-blue-900/30 text-blue-300': isDark,
                            'border-blue-200 bg-blue-50 text-blue-800': !isDark,
                        })}>
                            Event: {lastEvent}
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default InteractiveBoard;
