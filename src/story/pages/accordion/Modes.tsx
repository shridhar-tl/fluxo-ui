import React from 'react';
import { Accordion } from '../../../components';
import type { AccordionItemDef } from '../../../components/accordion';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items: AccordionItemDef[] = [
    { id: 'q1', title: 'Can I open multiple panels?', content: 'Yes — set mode="multi" to allow any number of panels open at once.' },
    { id: 'q2', title: 'Is it keyboard accessible?', content: 'Arrow up/down moves focus between headers, Home/End jump to the ends, Space/Enter toggles a panel.' },
    { id: 'q3', title: 'Can items be disabled?', content: 'Yes — set disabled on the item. The header becomes un-focusable and un-togglable.', disabled: true },
];

const code = `<Accordion items={items} mode="multi" defaultOpen={['q1', 'q2']} />
<Accordion items={items} mode="single" chevronPosition="left" />`;

const Modes: React.FC = () => (
    <>
        <ComponentDemo title="Multi Mode & Chevron Position" description="Multi expand and left chevron.">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 640 }}>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Multi mode</div>
                    <Accordion items={items} mode="multi" variant="bordered" defaultOpen={['q1', 'q2']} />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Chevron on left</div>
                    <Accordion items={items} mode="single" variant="minimal" chevronPosition="left" />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Modes;
