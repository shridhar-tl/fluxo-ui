import React, { useRef, useState } from 'react';
import { Draggable } from '../../../components/drag-drop';
import { Sortable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

interface Card {
    id: number;
    title: string;
    description: string;
}

const INITIAL: Card[] = [
    { id: 1, title: 'Install grip handles', description: 'Only the grip on the left starts a drag.' },
    { id: 2, title: 'Body is interactive', description: 'You can still click buttons and select text in the body.' },
    { id: 3, title: 'Touch friendly', description: 'Works the same on mouse, touch, and pen.' },
];

const code = `function HandleRow({ card }) {
  const handleRef = useRef(null);
  return (
    <Draggable
      containerId="handles"
      index={card.index}
      item={card}
      dragHandle={handleRef}
    >
      <div className="row">
        <button ref={handleRef} aria-label="Drag">≡</button>
        <div className="body">{card.title}</div>
      </div>
    </Draggable>
  );
}`;

const HandleRow: React.FC<{ card: Card; index: number }> = ({ card, index }) => {
    const handleRef = useRef<HTMLButtonElement | null>(null);
    return (
        <Draggable containerId="handle-strict" index={index} id={card.id} item={card} itemType="card" dragHandle={handleRef}>
            <div className="flex items-stretch gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                    ref={handleRef}
                    type="button"
                    className="px-3 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-grab active:cursor-grabbing bg-gray-50 dark:bg-gray-900"
                    aria-label="Drag handle"
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="5" cy="3" r="1.2" /><circle cx="11" cy="3" r="1.2" />
                        <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
                        <circle cx="5" cy="13" r="1.2" /><circle cx="11" cy="13" r="1.2" />
                    </svg>
                </button>
                <div className="py-3 pr-4 flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{card.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.description}</div>
                    <button
                        type="button"
                        className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        onClick={(e) => { e.stopPropagation(); alert('Body button still works!'); }}
                    >
                        Click a body button
                    </button>
                </div>
            </div>
        </Draggable>
    );
};

const DragHandleStrict: React.FC = () => {
    const [cards, setCards] = useState<Card[]>(INITIAL);

    return (
        <>
            <ComponentDemo title="Strict Drag Handles (handle-only activation)">
                <div className="w-full max-w-lg">
                    <Sortable items={cards} onChange={setCards} idProp="id" itemType="card" gap="0.5rem">
                        {(card, idx) => <HandleRow card={card} index={idx} />}
                    </Sortable>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-500 text-center max-w-lg">
                    Try dragging the card body — nothing happens. Drag from the grip icon on the left to reorder. The body remains fully
                    interactive (text selection, button clicks).
                </p>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default DragHandleStrict;
