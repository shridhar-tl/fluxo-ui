import cn from 'classnames';
import React, { useState } from 'react';
import { Sortable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import type { KanbanItem } from './sortable-story-data';
import { columnColors, columnTitles, getTypeIcon } from './sortable-story-data';

const initialColumns: Record<string, KanbanItem[]> = {
    todo: [
        { id: 101, text: 'Review pull requests', type: 'review' },
        { id: 102, text: 'Update documentation', type: 'docs' },
        { id: 103, text: 'Fix bug in login', type: 'bug' },
    ],
    inProgress: [{ id: 104, text: 'Implement dark mode', type: 'feature' }],
    done: [{ id: 105, text: 'Setup CI/CD pipeline', type: 'devops' }],
};

const code = `import { Sortable } from 'fluxo-ui';

function KanbanBoard() {
  const [columns, setColumns] = useState({
    todo: [{ id: 1, text: 'Task 1' }],
    inProgress: [{ id: 2, text: 'Task 2' }],
    done: [{ id: 3, text: 'Task 3' }],
  });

  const handleDrop = (columnKey, source, target) => {
    if (source.containerId !== target.containerId) {
      const sourceKey = Object.keys(columns).find(
        key => columns[key].some(item => item.id === source.item.id)
      );

      setColumns({
        ...columns,
        [sourceKey]: columns[sourceKey].filter(
          item => item.id !== source.item.id
        ),
        [columnKey]: [...columns[columnKey], source.item],
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.keys(columns).map(columnKey => (
        <Sortable
          key={columnKey}
          items={columns[columnKey]}
          onChange={(newItems) =>
            setColumns({ ...columns, [columnKey]: newItems })
          }
          onDrop={(source, target) =>
            handleDrop(columnKey, source, target)
          }
          showPlaceholder
        >
          {(item) => <div>{item.text}</div>}
        </Sortable>
      ))}
    </div>
  );
}`;

const MultipleLists: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [columns, setColumns] = useState<Record<string, KanbanItem[]>>(initialColumns);

    return (
        <>
            <ComponentDemo title="Kanban Board with Sortable Columns">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.keys(columns) as Array<keyof typeof columns>).map((columnKey) => (
                        <div key={columnKey}>
                            <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                                {columnTitles[columnKey]}
                            </h3>
                            <Sortable
                                items={columns[columnKey]}
                                onChange={(newItems) => {
                                    setColumns((prev) => ({ ...prev, [columnKey]: newItems }));
                                }}
                                onDrop={(source) => {
                                    setColumns((prev) => {
                                        const newState = { ...prev };
                                        (Object.keys(newState) as Array<keyof typeof columns>).forEach((key) => {
                                            newState[key] = newState[key].filter((item: KanbanItem) => item.id !== source.item.id);
                                        });
                                        newState[columnKey] = [...newState[columnKey], source.item];
                                        return newState;
                                    });
                                }}
                                className="min-h-75 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3"
                                dropIndicator="highlight"
                                showPlaceholder
                                placeholder={<div className="text-center text-gray-500 text-sm">Drop here</div>}
                            >
                                {(item) => (
                                    <div className={`rounded-lg p-3 transition-colors border ${columnColors[columnKey]}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getTypeIcon(item.type)}</span>
                                            <span className="text-gray-800 dark:text-white text-sm flex-1">{item.text}</span>
                                        </div>
                                    </div>
                                )}
                            </Sortable>
                        </div>
                    ))}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default MultipleLists;
