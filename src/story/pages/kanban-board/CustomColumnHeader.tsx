import cn from 'classnames';
import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import type { KanbanColumnData } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicColumns, basicCards } from './kanban-story-data';

const code = `<KanbanBoard
  columns={columns}
  cards={cards}
  draggable
  columnHeaderTemplate={(column, cardCount) => (
    <div className="flex items-center gap-2 px-3 py-2">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: column.color }}
      />
      <span className="text-sm font-semibold flex-1">
        {column.title}
      </span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
        {cardCount}
      </span>
    </div>
  )}
  emptyColumnTemplate={(column) => (
    <div className="text-center py-8 text-sm text-gray-400 italic">
      No items in {column.title}
    </div>
  )}
/>`;

const CustomColumnHeader: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo title="Custom Column Header & Empty State" description="Use columnHeaderTemplate and emptyColumnTemplate for full control over column rendering." centered={false}>
                <KanbanBoard
                    columns={basicColumns}
                    cards={basicCards}
                    draggable
                    columnHeaderTemplate={(column: KanbanColumnData, cardCount: number) => (
                        <div className="flex items-center gap-2 px-3 py-2.5">
                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: column.color }}
                            />
                            <span className={cn('text-sm font-semibold flex-1', { 'text-gray-100': isDark, 'text-gray-800': !isDark })}>
                                {column.title}
                            </span>
                            <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', {
                                'bg-white/10 text-gray-400': isDark,
                                'bg-gray-100 text-gray-500': !isDark,
                            })}>
                                {cardCount}
                            </span>
                        </div>
                    )}
                    emptyColumnTemplate={(column: KanbanColumnData) => (
                        <div className={cn('text-center py-8 text-sm italic', { 'text-gray-600': isDark, 'text-gray-400': !isDark })}>
                            No items in {column.title}
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

export default CustomColumnHeader;
