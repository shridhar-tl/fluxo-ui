import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { lockedColumns, lockedCards } from './kanban-story-data';

const code = `const columns: KanbanColumnData[] = [
  { id: 'new', title: 'New', color: '#3b82f6' },
  { id: 'active', title: 'Active', color: '#f59e0b' },
  { id: 'archived', title: 'Archived', color: '#94a3b8', locked: true },
];

<KanbanBoard
  columns={columns}
  cards={cards}
  draggable
  allowAddCard
  showCardCount
/>`;

const LockedColumns: React.FC = () => (
    <>
        <ComponentDemo title="Locked Columns" description="Set locked: true on a column to prevent drag-and-drop and hide add/delete controls. Ideal for archival or read-only columns." centered={false}>
            <KanbanBoard
                columns={lockedColumns}
                cards={lockedCards}
                draggable
                allowAddCard
                showCardCount
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default LockedColumns;
