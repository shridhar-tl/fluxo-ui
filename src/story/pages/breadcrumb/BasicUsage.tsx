import React from 'react';
import type { BreadcrumbItem } from '../../../components';
import { Breadcrumb } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items: BreadcrumbItem[] = [
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#' },
    { label: 'Electronics', href: '#' },
    { label: 'Laptops' },
];

const code = `import { Breadcrumb } from 'fluxo-ui';
import type { BreadcrumbItem } from 'fluxo-ui';

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Laptops' },
];

<Breadcrumb
  items={items}
  onItemClick={(item, index) => console.log(item.label, index)}
/>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Standard Breadcrumb" description="A simple breadcrumb trail with the last item as the current page.">
            <Breadcrumb items={items} onItemClick={(item, index) => console.log('Clicked:', item.label, index)} />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
