import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicColumns, basicCards } from './kanban-story-data';

const code = `import { KanbanBoard } from 'ether-ui';
import type { KanbanCardData, KanbanColumnData } from 'ether-ui';

const columns: KanbanColumnData[] = [
  { id: 'backlog', title: 'Backlog', color: '#94a3b8' },
  { id: 'todo', title: 'To Do', color: '#3b82f6' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b', limit: 3 },
  { id: 'review', title: 'Review', color: '#8b5cf6' },
  { id: 'done', title: 'Done', color: '#10b981' },
];

const cards: KanbanCardData[] = [
  {
    id: '1',
    title: 'Design landing page mockup',
    columnId: 'backlog',
    order: 0,
    priority: 'medium',
    labels: [{ id: 'design', text: 'Design', color: '#8b5cf6' }],
    assignee: { id: 'a1', name: 'Alice Martin' },
  },
  // ...more cards
];

<KanbanBoard
  columns={columns}
  cards={cards}
  draggable
  showCardCount
  showColumnLimit
  showSearch
  allowCollapse
/>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Basic Kanban Board" description="Standard board with drag-and-drop, card count, search, and collapsible columns." centered={false}>
            <div style={{ overflow: 'auto' }}>
                <KanbanBoard
                    columns={basicColumns}
                    cards={basicCards}
                    draggable
                    showCardCount
                    showColumnLimit
                    showSearch
                    allowCollapse
                    onCardClick={(e) => console.log('Clicked:', e.card.title)}
                />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
