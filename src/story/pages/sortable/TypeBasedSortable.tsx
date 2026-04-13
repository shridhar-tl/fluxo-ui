import cn from 'classnames';
import React, { useState } from 'react';
import { Sortable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { Sortable } from 'ether-ui/dnd';

function TypeBasedSorting() {
  const [items, setItems] = useState({
    features: [
      { id: 1, text: 'User Auth', type: 'feature' },
      { id: 2, text: 'Dark Mode', type: 'feature' },
    ],
    bugs: [
      { id: 3, text: 'Memory Leak', type: 'bug' },
    ],
    mixed: [],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Features - only accepts feature type */}
      <Sortable
        items={items.features}
        onChange={(newItems) =>
          setItems(prev => ({ ...prev, features: newItems }))
        }
        itemType="feature"
      >
        {(item) => <div>{item.text}</div>}
      </Sortable>

      {/* Bugs - only accepts bug type */}
      <Sortable
        items={items.bugs}
        onChange={(newItems) =>
          setItems(prev => ({ ...prev, bugs: newItems }))
        }
        itemType="bug"
      >
        {(item) => <div>{item.text}</div>}
      </Sortable>

      {/* Mixed - accepts both types */}
      <Sortable
        items={items.mixed}
        accept={['feature', 'bug']}
        onChange={(newItems) =>
          setItems(prev => ({ ...prev, mixed: newItems }))
        }
        onDrop={(source) => {
          setItems(prev => {
            const newState = { ...prev };
            if (source.itemType === 'feature') {
              newState.features = newState.features.filter(
                item => item.id !== source.item.id
              );
            } else if (source.itemType === 'bug') {
              newState.bugs = newState.bugs.filter(
                item => item.id !== source.item.id
              );
            }
            newState.mixed = [...newState.mixed, source.item];
            return newState;
          });
        }}
      >
        {(item) => <div>{item.text}</div>}
      </Sortable>
    </div>
  );
}`;

const TypeBasedSortable: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [typeBasedItems, setTypeBasedItems] = useState({
        features: [
            { id: 201, text: 'User Authentication', type: 'feature' },
            { id: 202, text: 'Dark Mode Toggle', type: 'feature' },
            { id: 203, text: 'File Upload', type: 'feature' },
        ],
        bugs: [
            { id: 204, text: 'Memory Leak in Dashboard', type: 'bug' },
            { id: 205, text: 'Form Validation Error', type: 'bug' },
        ],
        mixed: [] as Array<{ id: number; text: string; type: string }>,
    });

    return (
        <>
            <ComponentDemo title="Accept Only Specific Types">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Features</h3>
                        <Sortable
                            items={typeBasedItems.features}
                            onChange={(newItems) => {
                                setTypeBasedItems((prev) => ({ ...prev, features: newItems }));
                            }}
                            itemType="feature"
                            className="space-y-2 min-h-62.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
                        >
                            {(item) => (
                                <div className="bg-blue-600 rounded-lg p-3 cursor-move hover:bg-blue-500 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">✨</span>
                                        <span className="text-white text-sm flex-1">{item.text}</span>
                                    </div>
                                </div>
                            )}
                        </Sortable>
                    </div>

                    <div>
                        <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Bugs</h3>
                        <Sortable
                            items={typeBasedItems.bugs}
                            onChange={(newItems) => {
                                setTypeBasedItems((prev) => ({ ...prev, bugs: newItems }));
                            }}
                            itemType="bug"
                            className="space-y-2 min-h-62.5 bg-red-50 dark:bg-red-900/20 rounded-lg p-3"
                        >
                            {(item) => (
                                <div className="bg-red-600 rounded-lg p-3 cursor-move hover:bg-red-500 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🐛</span>
                                        <span className="text-white text-sm flex-1">{item.text}</span>
                                    </div>
                                </div>
                            )}
                        </Sortable>
                    </div>

                    <div>
                        <h3 className={cn('text-sm font-medium mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Mixed (Accepts Both)</h3>
                        <Sortable
                            items={typeBasedItems.mixed}
                            accept={['feature', 'bug']}
                            onChange={(newItems) => {
                                setTypeBasedItems((prev) => ({ ...prev, mixed: newItems }));
                            }}
                            onDrop={(source) => {
                                setTypeBasedItems((prev) => {
                                    const newState = { ...prev };
                                    if (source.itemType === 'feature') {
                                        newState.features = newState.features.filter((item) => item.id !== source.item.id);
                                    } else if (source.itemType === 'bug') {
                                        newState.bugs = newState.bugs.filter((item) => item.id !== source.item.id);
                                    }
                                    if (!newState.mixed.some((item) => item.id === source.item.id)) {
                                        newState.mixed = [...newState.mixed, source.item];
                                    }
                                    return newState;
                                });
                            }}
                            className="space-y-2 min-h-62.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3"
                            showPlaceholder
                            placeholder={
                                <div className="border-2 border-dashed border-purple-400 dark:border-purple-700 rounded-lg p-4 text-center text-purple-600 dark:text-purple-400 text-sm">
                                    Drop features or bugs here
                                </div>
                            }
                        >
                            {(item) => (
                                <div className={`rounded-lg p-3 cursor-move transition-colors ${
                                    item.type === 'feature'
                                        ? 'bg-blue-700 hover:bg-blue-600'
                                        : 'bg-red-700 hover:bg-red-600'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{item.type === 'feature' ? '✨' : '🐛'}</span>
                                        <span className="text-white text-sm flex-1">{item.text}</span>
                                    </div>
                                </div>
                            )}
                        </Sortable>
                    </div>
                </div>
                <p className={cn('text-sm mt-4', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Try dragging items between columns. The "Mixed" column accepts both features and bugs,
                    but features and bugs columns only accept their own types.
                </p>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default TypeBasedSortable;
