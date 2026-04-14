import React, { useState } from 'react';
import { Sortable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Sortable } from 'fluxo-ui/dnd';

function ListWithHandles() {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);

  return (
    <Sortable
      items={items}
      onChange={setItems}
      provideDragRef
    >
      {(item, index, { draggable }) => (
        <div className="flex items-center gap-3">
          {/* Custom drag handle */}
          <div ref={draggable?.dragRef} className="cursor-move">
            ⋮⋮
          </div>
          <div className="flex-1">{item}</div>
        </div>
      )}
    </Sortable>
  );
}`;

const DragHandles: React.FC = () => {
    const [items, setItems] = useState(['First Item', 'Second Item', 'Third Item']);

    return (
        <>
            <ComponentDemo title="Using provideDragRef for Custom Handles">
                <Sortable items={items} onChange={(newItems) => setItems(newItems)} provideDragRef>
                    {(item, index, { draggable }) => (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div
                                ref={draggable?.dragRef}
                                className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                            </div>
                            <div className="flex-1 text-gray-900 dark:text-white">{item}</div>
                            <div className="text-gray-500 text-sm">#{index + 1}</div>
                        </div>
                    )}
                </Sortable>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default DragHandles;
