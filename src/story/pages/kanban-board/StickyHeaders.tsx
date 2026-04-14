import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicColumns, basicCards } from './kanban-story-data';

const code = `<KanbanBoard
  columns={columns}
  cards={cards}
  draggable
  showCardCount
  stickyColumnHeaders
  maxColumnHeight={300}
/>`;

const StickyHeaders: React.FC = () => (
    <>
        <ComponentDemo title="Sticky Column Headers" description="Enable stickyColumnHeaders with maxColumnHeight to keep column headers visible while scrolling through cards." centered={false}>
            <KanbanBoard
                columns={basicColumns}
                cards={basicCards}
                draggable
                showCardCount
                stickyColumnHeaders
                maxColumnHeight={300}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default StickyHeaders;
