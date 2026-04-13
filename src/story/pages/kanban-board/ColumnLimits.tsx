import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { wipColumns, wipCards } from './kanban-story-data';

const code = `const columns: KanbanColumnData[] = [
  { id: 'todo', title: 'To Do', color: '#3b82f6' },
  { id: 'dev', title: 'Development', color: '#f59e0b', limit: 2 },
  { id: 'qa', title: 'QA', color: '#8b5cf6', limit: 2 },
  { id: 'done', title: 'Done', color: '#10b981' },
];

<KanbanBoard
  columns={columns}
  cards={cards}
  draggable
  showCardCount
  showColumnLimit
/>`;

const ColumnLimits: React.FC = () => (
    <>
        <ComponentDemo title="WIP Limits" description="Set limit on columns to enforce work-in-progress constraints. Columns exceeding their limit display a visual warning." centered={false}>
            <div style={{ overflow: 'auto' }}>
                <KanbanBoard
                    columns={wipColumns}
                    cards={wipCards}
                    draggable
                    showCardCount
                    showColumnLimit
                />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ColumnLimits;
