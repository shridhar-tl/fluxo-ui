import React, { useState } from 'react';
import type { KanbanCardData, KanbanColumnData, KanbanColumnId } from '../../../components/kanban-board';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const columns: KanbanColumnData[] = [
    { id: 'backlog', title: 'Backlog', color: '#94a3b8' },
    { id: 'todo', title: 'To Do', color: '#3b82f6' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'review', title: 'Code Review', color: '#8b5cf6', collapsed: true },
    { id: 'done', title: 'Done', color: '#10b981' },
];

const cards: KanbanCardData[] = [
    { id: '1', title: 'Design landing page mockup', columnId: 'backlog', order: 0, priority: 'medium' },
    { id: '2', title: 'Implement user auth API', columnId: 'backlog', order: 1, priority: 'high' },
    { id: '3', title: 'Set up CI/CD pipeline', columnId: 'todo', order: 0, priority: 'low' },
    { id: '4', title: 'Write unit tests for auth', columnId: 'todo', order: 1, priority: 'medium' },
    { id: '5', title: 'Build dashboard layout', columnId: 'in-progress', order: 0, priority: 'high' },
    { id: '6', title: 'API rate limiting', columnId: 'in-progress', order: 1, priority: 'critical' },
    { id: '7', title: 'Review PR #142', columnId: 'review', order: 0, priority: 'medium' },
    { id: '8', title: 'Database migration script', columnId: 'done', order: 0, priority: 'low' },
    { id: '9', title: 'Setup logging infrastructure', columnId: 'done', order: 1, priority: 'medium' },
];

const code = `import { KanbanBoard } from 'fluxo-ui';
import type { KanbanColumnData, KanbanCardData, KanbanColumnId } from 'fluxo-ui';

const columns: KanbanColumnData[] = [
  { id: 'backlog', title: 'Backlog', color: '#94a3b8' },
  { id: 'todo', title: 'To Do', color: '#3b82f6' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'review', title: 'Code Review', color: '#8b5cf6', collapsed: true },
  { id: 'done', title: 'Done', color: '#10b981' },
];

// Set collapsed: true on a column to have it collapsed by default.
// Enable allowCollapse to show collapse/expand toggle in column headers.
// Collapsed columns shrink to ~40px with a vertically rotated title.
// Click on a collapsed column to expand it.

<KanbanBoard
  columns={columns}
  cards={cards}
  allowCollapse
  showCardCount
  onColumnCollapse={(columnId, collapsed) => {
    console.log(columnId, collapsed ? 'collapsed' : 'expanded');
  }}
/>`;

const CollapsibleColumns: React.FC = () => {
    const [lastEvent, setLastEvent] = useState('');

    return (
        <>
            <ComponentDemo
                title="Collapsible Columns"
                description="Click the collapse button in the column header to collapse a column. The 'Code Review' column starts collapsed. Collapsed columns display a rotated vertical title and remaining columns fill the available space. Click a collapsed column to expand it."
                centered={false}
            >
                <KanbanBoard
                    columns={columns}
                    cards={cards}
                    allowCollapse
                    showCardCount
                    onColumnCollapse={(columnId: KanbanColumnId, collapsed: boolean) => {
                        setLastEvent(`${String(columnId)} ${collapsed ? 'collapsed' : 'expanded'}`);
                    }}
                />
                {lastEvent && (
                    <p className="mt-2 text-xs text-gray-500">
                        Last event: <strong>{lastEvent}</strong>
                    </p>
                )}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CollapsibleColumns;
