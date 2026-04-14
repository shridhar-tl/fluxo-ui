import cn from 'classnames';
import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import type { KanbanCardData, KanbanColumnData } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { compactColumns, compactCards } from './kanban-story-data';

const code = `<KanbanBoard
  columns={columns}
  cards={cards}
  draggable
  showCardCount
  cardActionsTemplate={(card, column) => (
    <div className="flex items-center gap-1">
      <button
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-100"
        onClick={() => console.log('Edit:', card.title)}
      >
        Edit
      </button>
      <button
        className="px-2 py-0.5 text-xs rounded hover:bg-gray-100"
        onClick={() => console.log('Archive:', card.title)}
      >
        Archive
      </button>
    </div>
  )}
/>`;

const CardActions: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo title="Custom Card Actions" description="Use cardActionsTemplate to add action buttons in the card footer area." centered={false}>
                <KanbanBoard
                    columns={compactColumns}
                    cards={compactCards}
                    draggable
                    showCardCount
                    cardActionsTemplate={(card: KanbanCardData, _column: KanbanColumnData) => (
                        <div className="flex items-center gap-1 mt-1">
                            <button
                                className={cn('px-2 py-0.5 text-[11px] rounded transition-colors', {
                                    'hover:bg-white/10 text-gray-400': isDark,
                                    'hover:bg-gray-100 text-gray-500': !isDark,
                                })}
                                onClick={(e) => { e.stopPropagation(); console.log('Edit:', card.title); }}
                                type="button"
                            >
                                Edit
                            </button>
                            <button
                                className={cn('px-2 py-0.5 text-[11px] rounded transition-colors', {
                                    'hover:bg-white/10 text-gray-400': isDark,
                                    'hover:bg-gray-100 text-gray-500': !isDark,
                                })}
                                onClick={(e) => { e.stopPropagation(); console.log('Archive:', card.title); }}
                                type="button"
                            >
                                Archive
                            </button>
                        </div>
                    )}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CardActions;
