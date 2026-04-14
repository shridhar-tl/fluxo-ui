import cn from 'classnames';
import React, { useState } from 'react';
import { Draggable, Droppable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import type { TypeBasedFile } from './drag-drop-story-data';

const code = `import { Draggable, Droppable } from 'fluxo-ui/dnd';

function TypeBasedDragDrop() {
  const [items, setItems] = useState({
    images: [
      { id: 1, name: 'photo1.jpg', type: 'image' },
      { id: 2, name: 'photo2.png', type: 'image' },
    ],
    documents: [
      { id: 3, name: 'report.pdf', type: 'document' },
    ],
    imageFolder: [],
    recyclingBin: [],
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Images Source */}
      <div>
        {items.images.map((item, index) => (
          <Draggable
            key={item.id}
            containerId="images"
            index={index}
            item={item}
            itemType="image"
            onRemove={(source) => {
              setItems(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== source.index),
              }));
            }}
          >
            <div>{item.name}</div>
          </Draggable>
        ))}
      </div>

      {/* Image Folder - Only accepts images */}
      <Droppable
        containerId="image-folder"
        index={0}
        accept="image"
        onDrop={(source) => {
          setItems(prev => ({
            ...prev,
            imageFolder: [...prev.imageFolder, source.item],
          }));
        }}
      >
        {({ dropRef, isOver, canDrop }) => (
          <div
            ref={dropRef}
            className={\`\${isOver && canDrop ? 'bg-blue-500/20' : ''}\`}
          >
            {items.imageFolder.length > 0
              ? items.imageFolder.map(item => <div key={item.id}>{item.name}</div>)
              : 'Drop images here'}
          </div>
        )}
      </Droppable>

      {/* Recycling Bin - Accepts both types */}
      <Droppable
        containerId="bin"
        index={0}
        accept={['image', 'document']}
        onDrop={(source) => {
          setItems(prev => ({
            ...prev,
            recyclingBin: [...prev.recyclingBin, source.item],
          }));
        }}
      >
        {({ dropRef }) => (
          <div ref={dropRef}>
            {items.recyclingBin.map(item => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>
        )}
      </Droppable>
    </div>
  );
}`;

const TypeBasedDragDrop: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [typeBasedItems, setTypeBasedItems] = useState({
        images: [
            { id: 1, name: 'photo1.jpg', type: 'image' },
            { id: 2, name: 'photo2.png', type: 'image' },
            { id: 3, name: 'photo3.gif', type: 'image' },
        ],
        documents: [
            { id: 4, name: 'report.pdf', type: 'document' },
            { id: 5, name: 'notes.docx', type: 'document' },
        ],
        imageFolder: [] as TypeBasedFile[],
        documentFolder: [] as TypeBasedFile[],
        recyclingBin: [] as TypeBasedFile[],
    });

    return (
        <>
            <ComponentDemo title="Accept Only Specific Item Types">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                        <h3 className={cn('text-sm font-medium mb-2', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Images</h3>
                        <div className="space-y-2">
                            {typeBasedItems.images.map((item, index) => (
                                <Draggable
                                    key={item.id}
                                    containerId="images-source"
                                    index={index}
                                    item={item}
                                    itemType="image"
                                    onRemove={(source) => {
                                        setTypeBasedItems((prev) => ({
                                            ...prev,
                                            images: prev.images.filter((_, i) => i !== source.index),
                                        }));
                                    }}
                                >
                                    <div className="bg-blue-600 text-white px-3 py-2 rounded cursor-move hover:bg-blue-500 transition-colors flex items-center gap-2">
                                        <span>🖼️</span>
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                </Draggable>
                            ))}
                        </div>

                        <h3 className={cn('text-sm font-medium mb-2 mt-4', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            Documents
                        </h3>
                        <div className="space-y-2">
                            {typeBasedItems.documents.map((item, index) => (
                                <Draggable
                                    key={item.id}
                                    containerId="documents-source"
                                    index={index}
                                    item={item}
                                    itemType="document"
                                    onRemove={(source) => {
                                        setTypeBasedItems((prev) => ({
                                            ...prev,
                                            documents: prev.documents.filter((_, i) => i !== source.index),
                                        }));
                                    }}
                                >
                                    <div className="bg-green-600 text-white px-3 py-2 rounded cursor-move hover:bg-green-500 transition-colors flex items-center gap-2">
                                        <span>📄</span>
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                </Draggable>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className={cn('text-sm font-medium mb-2', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            Image Folder (Images Only)
                        </h3>
                        <Droppable
                            containerId="image-folder"
                            index={0}
                            accept="image"
                            onDrop={(source) => {
                                setTypeBasedItems((prev) => ({
                                    ...prev,
                                    imageFolder: [...prev.imageFolder, source.item],
                                }));
                            }}
                            className="min-h-30 border-2 border-dashed rounded-lg p-3 border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        >
                            {typeBasedItems.imageFolder.length > 0 ? (
                                <div className="space-y-1">
                                    {typeBasedItems.imageFolder.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                                        >
                                            <span>🖼️</span>
                                            <span>{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8 text-sm">Drop images here</div>
                            )}
                        </Droppable>

                        <h3 className={cn('text-sm font-medium mb-2 mt-4', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            Document Folder (Documents Only)
                        </h3>
                        <Droppable
                            containerId="document-folder"
                            index={0}
                            accept="document"
                            onDrop={(source) => {
                                setTypeBasedItems((prev) => ({
                                    ...prev,
                                    documentFolder: [...prev.documentFolder, source.item],
                                }));
                            }}
                            className="min-h-30 border-2 border-dashed rounded-lg p-3 border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                        >
                            {typeBasedItems.documentFolder.length > 0 ? (
                                <div className="space-y-1">
                                    {typeBasedItems.documentFolder.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                                        >
                                            <span>📄</span>
                                            <span>{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-8 text-sm">Drop documents here</div>
                            )}
                        </Droppable>
                    </div>

                    <div className="space-y-3">
                        <h3 className={cn('text-sm font-medium mb-2', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            Recycling Bin (Accepts All)
                        </h3>
                        <Droppable
                            containerId="recycling-bin"
                            index={0}
                            accept={['image', 'document']}
                            onDrop={(source) => {
                                setTypeBasedItems((prev) => ({
                                    ...prev,
                                    recyclingBin: [...prev.recyclingBin, source.item],
                                }));
                            }}
                            className="min-h-75 border-2 border-dashed rounded-lg p-3 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                        >
                            {typeBasedItems.recyclingBin.length > 0 ? (
                                <div className="space-y-1">
                                    {typeBasedItems.recyclingBin.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                                                item.type === 'image' ? 'bg-blue-700 text-white' : 'bg-green-700 text-white'
                                            }`}
                                        >
                                            <span>{item.type === 'image' ? '🖼️' : '📄'}</span>
                                            <span>{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center py-24 text-sm">
                                    <div className="text-4xl mb-2">🗑️</div>
                                    Drop any file here
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
                <p className={cn('text-sm mt-4', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Try dragging files to different folders. The Image Folder only accepts images, Document Folder only accepts documents,
                    but the Recycling Bin accepts both types. Try dragging a document to the Image Folder — it won't be accepted!
                </p>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default TypeBasedDragDrop;
