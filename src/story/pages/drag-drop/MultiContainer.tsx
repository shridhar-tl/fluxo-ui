import cn from 'classnames';
import React, { useState } from 'react';
import { Draggable, Droppable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { Draggable, Droppable } from 'ether-ui/dnd';

function KanbanBoard() {
  const [items, setItems] = useState({
    todo: ['Task A', 'Task B', 'Task C'],
    done: [],
  });

  const handleDrop = (source, target) => {
    const sourceContainer = source.containerId;
    const targetContainer = target.containerId;

    if (sourceContainer === targetContainer) return;

    setItems(prev => ({
      todo: sourceContainer === 'todo'
        ? prev.todo.filter((_, i) => i !== source.index)
        : prev.todo,
      done: targetContainer === 'done'
        ? [...prev.done, source.item]
        : prev.done,
    }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
      <Droppable containerId="todo" index={0} accept="task" onDrop={handleDrop}>
        {({ dropRef, isOver }) => (
          <div ref={dropRef}>
            {items.todo.map((item, index) => (
              <Draggable
                key={index}
                containerId="todo"
                index={index}
                item={item}
                itemType="task"
              >
                <div>{item}</div>
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>

      <Droppable containerId="done" index={0} accept="task" onDrop={handleDrop}>
        {({ dropRef }) => (
          <div ref={dropRef}>
            {items.done.map((item, idx) => (
              <div key={idx}>{item}</div>
            ))}
          </div>
        )}
      </Droppable>
    </div>
  );
}`;

const MultiContainer: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [multiContainerItems, setMultiContainerItems] = useState({
        source: ['Task A', 'Task B', 'Task C'],
        done: [] as string[],
    });

    const handleMultiContainerDrop = (source: any, target: any) => {
        const sourceContainer = source.containerId;
        const targetContainer = target.containerId;

        if (sourceContainer === targetContainer) {
            return;
        }

        setMultiContainerItems((prev) => ({
            source: sourceContainer === 'source'
                ? prev.source.filter((_: string, i: number) => i !== source.index)
                : prev.source,
            done: targetContainer === 'done'
                ? [...prev.done, source.item]
                : prev.done,
        }));
    };

    return (
        <>
            <ComponentDemo title="Kanban-style Board">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                    <div className="flex-1">
                        <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>To Do</h3>
                        <Droppable
                            containerId="source"
                            index={0}
                            accept="task"
                            onDrop={handleMultiContainerDrop}
                        >
                            {({ dropRef, isOver, canDrop }) => (
                                <div
                                    ref={dropRef}
                                    className={`border-2 border-dashed rounded p-4 min-h-62.5 transition-colors ${
                                        isOver && canDrop
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        {multiContainerItems.source.map((item, index) => (
                                            <Draggable
                                                key={index}
                                                containerId="source"
                                                index={index}
                                                item={item}
                                                itemType="task"
                                            >
                                                <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-3 rounded cursor-move hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                                    {item}
                                                </div>
                                            </Draggable>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </div>
                    <div className="flex-1">
                        <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Done</h3>
                        <Droppable
                            containerId="done"
                            index={0}
                            accept="task"
                            onDrop={handleMultiContainerDrop}
                        >
                            {({ dropRef, isOver, canDrop }) => (
                                <div
                                    ref={dropRef}
                                    className={`border-2 border-dashed rounded p-4 min-h-62.5 transition-colors ${
                                        isOver && canDrop
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        {multiContainerItems.done.map((item, index) => (
                                            <div
                                                key={index}
                                                className="bg-green-600 text-white px-4 py-3 rounded"
                                            >
                                                {item}
                                            </div>
                                        ))}
                                        {multiContainerItems.done.length === 0 && (
                                            <div className="text-gray-500 text-center py-8">
                                                Drop completed tasks here
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default MultiContainer;
