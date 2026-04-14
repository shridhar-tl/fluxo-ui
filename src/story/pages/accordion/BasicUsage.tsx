import React from 'react';
import { Accordion } from '../../../components';
import type { AccordionItemDef } from '../../../components/accordion';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items: AccordionItemDef[] = [
    {
        id: 'overview',
        title: 'What is FluxoUI?',
        content: 'FluxoUI is a React component library built with TypeScript, Vite, and Tailwind CSS v4. It ships tree-shakable components with TypeScript types, hooks, icons, and a custom state-management store.',
    },
    {
        id: 'install',
        title: 'Installation',
        content: 'Install via npm: `npm install fluxo-ui`. Then import the components you need and include the stylesheet once at your app root.',
    },
    {
        id: 'theming',
        title: 'Theming',
        content: 'FluxoUI uses CSS custom properties for all themeable values. Five brand themes plus dark mode are available out of the box via body classes.',
    },
];

const code = `import { Accordion } from 'fluxo-ui';

<Accordion items={items} mode="single" defaultOpen={['overview']} />`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Basic Accordion" description="Single-open mode.">
            <div style={{ width: '100%', maxWidth: 640 }}>
                <Accordion items={items} mode="single" defaultOpen={['overview']} />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
