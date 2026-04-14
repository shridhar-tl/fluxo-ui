import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { blockedColumns, blockedCards } from './kanban-story-data';

const code = `const cards: KanbanCardData[] = [
  {
    id: 'b1',
    title: 'Implement SSO integration',
    columnId: 'in-progress',
    order: 0,
    priority: 'high',
    blocked: true,
    color: '#ef4444',
    description: 'Blocked: Waiting for IdP credentials.',
  },
  {
    id: 'b2',
    title: 'Mobile push notifications',
    columnId: 'in-progress',
    order: 1,
    priority: 'medium',
    blocked: true,
  },
  // non-blocked cards...
];

<KanbanBoard
  columns={columns}
  cards={cards}
  cardSize="detailed"
  draggable
  showCardCount
/>`;

const BlockedCards: React.FC = () => (
    <>
        <ComponentDemo title="Blocked Cards" description="Set blocked: true on a card to visually indicate it is blocked. Combine with color to add a colored left border." centered={false}>
            <KanbanBoard
                columns={blockedColumns}
                cards={blockedCards}
                cardSize="detailed"
                draggable
                showCardCount
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BlockedCards;
