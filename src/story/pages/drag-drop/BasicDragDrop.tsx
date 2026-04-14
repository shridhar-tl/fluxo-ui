import cn from 'classnames';
import React, { useState } from 'react';
import { Draggable, Droppable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { sourceItems } from './drag-drop-story-data';

const code = `import { Draggable, Droppable } from 'fluxo-ui';

function DragDropExample() {
  const [items] = useState(['Item 1', 'Item 2', 'Item 3']);
  const [droppedItems, setDroppedItems] = useState([]);

  const handleDrop = (source, target) => {
    setDroppedItems([...droppedItems, source.item]);
  };

  return (
    <div className="flex gap-8">
      {/* Source */}
      <div>
        {items.map((item, index) => (
          <Draggable
            key={index}
            containerId="source"
            index={index}
            item={item}
            itemType="task"
          >
            <div className="bg-blue-600 px-4 py-3 rounded cursor-move">
              {item}
            </div>
          </Draggable>
        ))}
      </div>

      {/* Drop Zone — built-in highlight indicator, no manual border logic needed */}
      <Droppable
        containerId="target"
        index={0}
        accept="task"
        onDrop={handleDrop}
        className="min-h-50 border-2 border-dashed border-gray-300 rounded-lg p-4"
      >
        {droppedItems.length > 0
          ? droppedItems.map((item, idx) => <div key={idx}>{item}</div>)
          : 'Drop here'}
      </Droppable>
    </div>
  );
}`;

const BasicDragDrop: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [droppedItems, setDroppedItems] = useState<string[]>([]);

    const handleDrop = (source: any) => {
        setDroppedItems((prev) => [...prev, source.item]);
    };

    return (
        <>
            <ComponentDemo title="Simple Drag & Drop">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                    <div className="flex-1">
                        <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            Draggable Items
                        </h3>
                        <div className="space-y-2">
                            {sourceItems.map((item, index) => (
                                <Draggable key={index} containerId="source" index={index} item={item} itemType="task">
                                    <div className="bg-blue-600 text-white px-4 py-3 rounded cursor-move hover:bg-blue-500 transition-colors">
                                        {item}
                                    </div>
                                </Draggable>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Drop Zone</h3>
                        <Droppable
                            containerId="target"
                            index={0}
                            accept="task"
                            onDrop={handleDrop}
                            className="min-h-50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
                        >
                            {droppedItems.length > 0 ? (
                                <div className="space-y-2">
                                    {droppedItems.map((item, idx) => (
                                        <div key={idx} className="bg-green-600 text-white px-4 py-3 rounded">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 dark:text-gray-500 text-center py-16">Drop items here</div>
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

export default BasicDragDrop;
