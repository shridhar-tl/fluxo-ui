import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { detailedColumns, detailedCards } from './kanban-story-data';

const code = `<KanbanBoard
  columns={columns}
  cards={cards}
  cardSize="detailed"
  draggable
  showCardCount
  showColumnLimit
  allowCollapse
/>

// Card data for detailed view includes:
const card: KanbanCardData = {
  id: 'd1',
  title: 'Redesign dashboard',
  columnId: 'todo',
  order: 0,
  description: 'Update all components to match new brand.',
  priority: 'high',
  labels: [
    { id: 'design', text: 'Design', color: '#8b5cf6' },
    { id: 'frontend', text: 'Frontend', color: '#3b82f6' },
  ],
  assignees: [
    { id: 'a1', name: 'Alice Martin' },
    { id: 'a2', name: 'Bob Chen' },
  ],
  dueDate: new Date('2025-04-15'),
  progress: 30,
  subtaskCount: 12,
  subtaskCompleted: 4,
  commentCount: 8,
  attachmentCount: 3,
};`;

const DetailedCards: React.FC = () => (
    <>
        <ComponentDemo title="Detailed Card View" description="Cards with descriptions, progress bars, labels, subtask counts, and assignee stacking." centered={false}>
            <KanbanBoard
                columns={detailedColumns}
                cards={detailedCards}
                cardSize="detailed"
                draggable
                showCardCount
                showColumnLimit
                allowCollapse
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default DetailedCards;
