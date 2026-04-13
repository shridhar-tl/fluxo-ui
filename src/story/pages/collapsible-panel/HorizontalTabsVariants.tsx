import React from 'react';
import { CollapsibleTabs } from '../../../components';
import type { CollapsibleTabItem, CollapsibleTabsVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CollapsibleTabs tabs={tabs} variant="bordered" />
<CollapsibleTabs tabs={tabs} variant="elevated" />`;

const makeTabs = (prefix: string): CollapsibleTabItem[] => [
    {
        id: `${prefix}-panel-a`,
        label: 'Panel A',
        isOpen: true,
        render: () => (
            <div className="p-4 h-full">
                <h3 className="font-semibold mb-1 text-sm">Panel A</h3>
                <p className="text-xs opacity-70">First panel content with full data view.</p>
            </div>
        ),
    },
    {
        id: `${prefix}-panel-b`,
        label: 'Panel B',
        isOpen: true,
        render: () => (
            <div className="p-4 h-full">
                <h3 className="font-semibold mb-1 text-sm">Panel B</h3>
                <p className="text-xs opacity-70">Second panel content with details.</p>
            </div>
        ),
    },
    {
        id: `${prefix}-panel-c`,
        label: 'Panel C',
        isOpen: false,
        render: () => (
            <div className="p-4 h-full">
                <h3 className="font-semibold mb-1 text-sm">Panel C</h3>
                <p className="text-xs opacity-70">Third panel, collapsed by default.</p>
            </div>
        ),
    },
];

const variants: CollapsibleTabsVariant[] = ['default', 'bordered', 'elevated'];

const HorizontalTabsVariants: React.FC = () => (
    <>
        <ComponentDemo title="Horizontal Tabs Variants" centered={false}>
            <div className="space-y-6 w-full">
                {variants.map((v) => (
                    <div key={v}>
                        <p className="text-sm font-medium mb-2 capitalize">{v}</p>
                        <div style={{ height: 180 }}>
                            <CollapsibleTabs tabs={makeTabs(v)} variant={v} height={180} />
                        </div>
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default HorizontalTabsVariants;
