import React, { useState } from 'react';
import { Sortable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Sortable } from 'ether-ui/dnd';

function SortableList() {
  const [items, setItems] = useState([
    'First Item',
    'Second Item',
    'Third Item',
    'Fourth Item',
  ]);

  return (
    <Sortable
      items={items}
      onChange={(newItems) => setItems(newItems)}
      className="space-y-2"
    >
      {(item, index) => (
        <div className="bg-blue-600 px-4 py-3 rounded cursor-move">
          {index + 1}. {item}
        </div>
      )}
    </Sortable>
  );
}`;

const BasicSortable: React.FC = () => {
    const [basicItems, setBasicItems] = useState([
        'First Item',
        'Second Item',
        'Third Item',
        'Fourth Item',
        'Fifth Item',
    ]);

    return (
        <>
            <ComponentDemo title="Simple List Reordering">
                <Sortable
                    items={basicItems}
                    onChange={(newItems) => setBasicItems(newItems)}
                    className="space-y-2"
                >
                    {(item, index) => (
                        <div className="bg-blue-600 text-white px-4 py-3 rounded cursor-move hover:bg-blue-500 transition-colors">
                            {index + 1}. {item}
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

export default BasicSortable;
