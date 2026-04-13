import cn from 'classnames';
import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { compactColumns, compactCards } from './kanban-story-data';

const code = `<KanbanBoard
  columns={columns}
  cards={cards}
  draggable
  showCardCount
  columnWidth={260}
  cardTemplate={(card) => (
    <div className="flex items-center gap-3 p-2">
      <span
        className={cn('w-2 h-2 rounded-full shrink-0', {
          'bg-red-500': card.priority === 'high' || card.priority === 'critical',
          'bg-yellow-500': card.priority === 'medium',
          'bg-green-500': card.priority === 'low',
        })}
      />
      <span className="text-sm font-medium truncate">
        {card.title}
      </span>
    </div>
  )}
/>`;

const CustomTemplates: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo title="Custom Card Template" description="Use cardTemplate to render fully custom card content with any layout." centered={false}>
                <div style={{ overflow: 'auto' }}>
                    <KanbanBoard
                        columns={compactColumns}
                        cards={compactCards}
                        draggable
                        showCardCount
                        columnWidth={260}
                        cardTemplate={(card) => (
                            <div className="flex items-center gap-3 p-2">
                                <span
                                    className={cn('w-2 h-2 rounded-full shrink-0', {
                                        'bg-red-500': card.priority === 'high' || card.priority === 'critical',
                                        'bg-yellow-500': card.priority === 'medium',
                                        'bg-green-500': card.priority === 'low',
                                    })}
                                />
                                <span className={cn('text-sm font-medium truncate', { 'text-gray-200': isDark, 'text-gray-700': !isDark })}>
                                    {card.title}
                                </span>
                            </div>
                        )}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CustomTemplates;
