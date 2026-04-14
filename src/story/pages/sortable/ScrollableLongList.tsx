import React, { useState, useMemo } from 'react';
import { Sortable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

interface ListRow {
    id: number;
    label: string;
    color: string;
}

const PALETTE = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

function makeRows(count: number, offset = 0): ListRow[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i + offset + 1,
        label: `Row #${i + offset + 1}`,
        color: PALETTE[(i + offset) % PALETTE.length]!,
    }));
}

const code = `// Scroll-aware Sortable: 500 items inside a 320px-tall scrollable container.
// Positioning is computed from viewport coordinates + getBoundingClientRect,
// so it remains correct at any scroll position. Auto-scroll engages near edges.
const [items, setItems] = useState(() => makeRows(500));

<div style={{ height: 320, overflow: 'auto' }}>
  <Sortable items={items} onChange={setItems} idProp="id">
    {(row) => <div style={{ background: row.color }}>{row.label}</div>}
  </Sortable>
</div>`;

const ScrollableLongList: React.FC = () => {
    const [items, setItems] = useState<ListRow[]>(() => makeRows(500));

    const stats = useMemo(() => ({ count: items.length, first: items[0]?.label, last: items[items.length - 1]?.label }), [items]);

    return (
        <>
            <ComponentDemo title="Scrollable Container + Long List (500 items)">
                <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {stats.count.toLocaleString()} rows · first: <strong>{stats.first}</strong> · last: <strong>{stats.last}</strong>
                </div>
                <div
                    style={{ height: 320, overflow: 'auto' }}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3"
                >
                    <Sortable items={items} onChange={setItems} idProp="id" gap="0.375rem">
                        {(row) => (
                            <div
                                className="rounded-md px-3 py-2 text-white text-sm font-medium select-none"
                                style={{ background: row.color }}
                            >
                                {row.label}
                            </div>
                        )}
                    </Sortable>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                    Drag a row near the top or bottom edge of the container — it auto-scrolls. Scroll the container while holding a drag, or
                    scroll the page — the insertion line stays locked to where the item will actually land.
                </p>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ScrollableLongList;
