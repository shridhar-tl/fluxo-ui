import cn from 'classnames';
import React, { useState } from 'react';
import { Draggable, Droppable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<Draggable containerId="source" index={0} item={item} itemType="feature">
  {({ isDragging, dragRef }) => (
    <div
      ref={dragRef}
      className={\`\${isDragging ? 'opacity-50 scale-105' : ''}\`}
    >
      {item}
    </div>
  )}
</Draggable>

<Droppable containerId="target" index={0} accept="feature" onDrop={handleDrop}>
  {({ dropRef, isOver, canDrop }) => (
    <div
      ref={dropRef}
      className={\`\${isOver && canDrop ? 'bg-green-500/20' : ''}\`}
    >
      {isOver ? 'Release to drop' : 'Drop here'}
    </div>
  )}
</Droppable>`;

const RenderProps: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [customStyleItems, setCustomStyleItems] = useState({
        available: ['Feature 1', 'Feature 2', 'Feature 3'],
        selected: [] as string[],
    });

    const handleCustomStyleDrop = (source: any, target: any) => {
        const sourceContainer = source.containerId;
        const targetContainer = target.containerId;

        if (sourceContainer === targetContainer) {
            return;
        }

        setCustomStyleItems((prev) => ({
            available: sourceContainer === 'available'
                ? prev.available.filter((_: string, i: number) => i !== source.index)
                : prev.available,
            selected: targetContainer === 'selected'
                ? [...prev.selected, source.item]
                : prev.selected,
        }));
    };

    return (
        <>
            <ComponentDemo title="Visual Feedback with Render Props">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                    <div className="flex-1">
                        <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Available Features</h3>
                        <div className="space-y-2">
                            {customStyleItems.available.map((item, index) => (
                                <Draggable
                                    key={index}
                                    containerId="available"
                                    index={index}
                                    item={item}
                                    itemType="feature"
                                >
                                    {({ isDragging, dragRef }) => (
                                        <div
                                            ref={dragRef}
                                            className={`px-4 py-3 rounded cursor-move transition-all ${
                                                isDragging
                                                    ? 'bg-blue-400 opacity-50 scale-105'
                                                    : 'bg-blue-600 hover:bg-blue-500'
                                            } text-white`}
                                        >
                                            {item}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Selected Features</h3>
                        <Droppable
                            containerId="selected"
                            index={0}
                            accept="feature"
                            onDrop={handleCustomStyleDrop}
                        >
                            {({ dropRef, isOver, canDrop }) => (
                                <div
                                    ref={dropRef}
                                    className={`border-2 border-dashed rounded p-4 min-h-50 transition-all ${
                                        isOver && canDrop
                                            ? 'border-purple-500 bg-purple-500/20 scale-105'
                                            : canDrop
                                            ? 'border-purple-500 dark:border-purple-600 bg-purple-50 dark:bg-purple-500/5'
                                            : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    {customStyleItems.selected.length > 0 ? (
                                        <div className="space-y-2">
                                            {customStyleItems.selected.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-purple-600 text-white px-4 py-3 rounded"
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-center py-16">
                                            {isOver ? 'Release to drop' : 'Drag features here'}
                                        </div>
                                    )}
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

export default RenderProps;
