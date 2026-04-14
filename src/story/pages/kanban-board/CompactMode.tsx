import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { compactColumns, compactCards } from './kanban-story-data';

const code = `<KanbanBoard
  columns={columns}
  cards={cards}
  cardSize="compact"
  draggable
  showCardCount
  columnWidth={240}
/>`;

const CompactMode: React.FC = () => (
    <>
        <ComponentDemo title="Compact Mode" description="Minimal card display ideal for high-density boards with many items." centered={false}>
            <KanbanBoard
                columns={compactColumns}
                cards={compactCards}
                cardSize="compact"
                draggable
                showCardCount
                columnWidth={240}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default CompactMode;
