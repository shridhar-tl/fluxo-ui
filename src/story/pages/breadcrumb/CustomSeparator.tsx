import React from 'react';
import type { BreadcrumbItem } from '../../../components';
import { Breadcrumb } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '#' },
    { label: 'Settings', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Two-Factor Auth' },
];

const arrowSeparator = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const code = `import { Breadcrumb } from 'fluxo-ui';

const arrowSeparator = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

<Breadcrumb items={items} separator={arrowSeparator} />

<Breadcrumb items={items} separator=">" />

<Breadcrumb items={items} separator="|" />`;

const CustomSeparator: React.FC = () => (
    <>
        <ComponentDemo title="Custom Separators" description="Use any ReactNode as a separator between breadcrumb items.">
            <div className="space-y-4">
                <div>
                    <span className="text-sm text-gray-500 mb-1 block">Arrow icon separator</span>
                    <Breadcrumb items={items} separator={arrowSeparator} />
                </div>
                <div>
                    <span className="text-sm text-gray-500 mb-1 block">Greater-than separator</span>
                    <Breadcrumb items={items} separator=">" />
                </div>
                <div>
                    <span className="text-sm text-gray-500 mb-1 block">Pipe separator</span>
                    <Breadcrumb items={items} separator="|" />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default CustomSeparator;
