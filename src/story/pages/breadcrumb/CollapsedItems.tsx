import React from 'react';
import { Breadcrumb } from '../../../components';
import type { BreadcrumbItem } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items: BreadcrumbItem[] = [
    { label: 'Home', href: '#' },
    { label: 'Region', href: '#' },
    { label: 'Country', href: '#' },
    { label: 'State', href: '#' },
    { label: 'City', href: '#' },
    { label: 'District', href: '#' },
    { label: 'Street' },
];

const code = `import { Breadcrumb } from 'ether-ui';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Region', href: '/region' },
  { label: 'Country', href: '/country' },
  { label: 'State', href: '/state' },
  { label: 'City', href: '/city' },
  { label: 'District', href: '/district' },
  { label: 'Street' },
];

<Breadcrumb items={items} maxItems={3} />`;

const CollapsedItems: React.FC = () => (
    <>
        <ComponentDemo title="Collapsed Items" description="When maxItems is set, middle items collapse into an ellipsis dropdown. Click the ellipsis to expand.">
            <Breadcrumb items={items} maxItems={3} />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default CollapsedItems;
