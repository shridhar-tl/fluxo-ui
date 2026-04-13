import React from 'react';
import { KanbanBoard } from '../../../components/kanban-board';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { verticalColumns, verticalCards } from './kanban-story-data';

const code = `<KanbanBoard
  columns={columns}
  cards={cards}
  layout="vertical"
  draggable
  showCardCount
  allowCollapse
/>`;

const VerticalLayout: React.FC = () => (
    <>
        <ComponentDemo title="Vertical Layout" description="Stack columns vertically instead of horizontally. Useful for priority triage or narrow containers." centered={false}>
            <div style={{ overflow: 'auto' }}>
                <KanbanBoard
                    columns={verticalColumns}
                    cards={verticalCards}
                    layout="vertical"
                    draggable
                    showCardCount
                    allowCollapse
                />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default VerticalLayout;
