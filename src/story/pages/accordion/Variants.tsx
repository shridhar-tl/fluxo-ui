import React from 'react';
import { Accordion } from '../../../components';
import type { AccordionItemDef, AccordionVariant } from '../../../components/accordion';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items: AccordionItemDef[] = [
    { id: 'a', title: 'Section A', content: 'Content for section A.' },
    { id: 'b', title: 'Section B', content: 'Content for section B.' },
    { id: 'c', title: 'Section C', content: 'Content for section C.' },
];

const variants: AccordionVariant[] = ['default', 'bordered', 'filled', 'minimal', 'separated'];

const code = `<Accordion items={items} variant="bordered" />
<Accordion items={items} variant="filled" />
<Accordion items={items} variant="separated" />`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Variants" description="Five visual styles for different contexts.">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {variants.map((v) => (
                    <div key={v}>
                        <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)', textTransform: 'capitalize' }}>{v}</div>
                        <Accordion items={items} variant={v} defaultOpen={['a']} />
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
