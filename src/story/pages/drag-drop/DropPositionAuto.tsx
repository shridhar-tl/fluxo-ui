import React, { useState } from 'react';
import { Draggable, Droppable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

interface Row {
    id: number;
    label: string;
}

const INITIAL: Row[] = [
    { id: 1, label: 'Alpha' },
    { id: 2, label: 'Bravo' },
    { id: 3, label: 'Charlie' },
    { id: 4, label: 'Delta' },
    { id: 5, label: 'Echo' },
];

const code = `// dropPosition="auto" splits each target in half and returns
// the exact insert index via position ('before' | 'after').
<Droppable
  containerId="list"
  index={i}
  dropPosition="auto"
  dropIndicator="line"
  edgeThreshold={12}
  onDrop={(source, target) => {
    // target.index already reflects before/after choice
    setItems((prev) => reorder(prev, source.index, target.index));
  }}
>
  {item}
</Droppable>`;

function reorder(items: Row[], from: number, to: number): Row[] {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    let insertAt = to;
    if (from < to) insertAt -= 1;
    next.splice(insertAt, 0, moved!);
    return next;
}

const DropPositionAuto: React.FC = () => {
    const [items, setItems] = useState<Row[]>(INITIAL);

    return (
        <>
            <ComponentDemo title="Drop Position Auto (before / after insertion)">
                <div className="flex flex-col gap-1 w-full max-w-md">
                    {items.map((row, i) => (
                        <Droppable
                            key={row.id}
                            containerId="drop-pos-auto"
                            index={i}
                            id={row.id}
                            accept="row"
                            dropIndicator="line"
                            dropPosition="auto"
                            edgeThreshold={12}
                            onDrop={(source, target) => {
                                if (source.containerId !== 'drop-pos-auto') return;
                                if (source.index === target.index || source.index + 1 === target.index) return;
                                setItems((prev) => reorder(prev, source.index, target.index));
                            }}
                        >
                            <Draggable containerId="drop-pos-auto" index={i} id={row.id} item={row} itemType="row">
                                <div className="bg-indigo-600 text-white px-4 py-3 rounded-md shadow-sm cursor-grab select-none">
                                    {row.label}
                                </div>
                            </Draggable>
                        </Droppable>
                    ))}
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-500 text-center max-w-md">
                    Hover the top half of any row to see the insertion line on the top edge; hover the bottom half to see it on the
                    bottom edge. Dropping lands exactly where the line is shown.
                </p>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default DropPositionAuto;
