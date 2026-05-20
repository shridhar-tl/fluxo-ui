import React, { useState } from 'react';
import { TabPage, TabView } from '../../../components';
import type { TabViewVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TabView variant="pills">...</TabView>
<TabView variant="enclosed">...</TabView>
<TabView variant="segment">...</TabView>
<TabView variant="editor">...</TabView>
<TabView variant="thick-border">...</TabView>
<TabView variant="elevated">...</TabView>
<TabView variant="glow">...</TabView>`;

const variants: { name: string; variant: TabViewVariant; description: string }[] = [
    { name: 'Default', variant: 'default', description: 'Standard underline indicator' },
    { name: 'Pills', variant: 'pills', description: 'Rounded pill-shaped active indicator with filled background' },
    { name: 'Enclosed', variant: 'enclosed', description: 'Browser-style tabs with bordered active panel' },
    { name: 'Segment', variant: 'segment', description: 'iOS-style segmented control with subtle background' },
    { name: 'Editor', variant: 'editor', description: 'VS Code / code editor style with top accent border' },
    { name: 'Thick Border', variant: 'thick-border', description: 'Bold top border highlight for the active tab' },
    { name: 'Elevated', variant: 'elevated', description: 'Larger active tab with font size change and thick bottom border' },
    { name: 'Glow', variant: 'glow', description: 'Pill track with an animated, primary-tinted glowing indicator that slides behind the active tab' },
];

const tabContent = [
    { header: 'Dashboard', content: 'Overview of your workspace and recent activity.' },
    { header: 'Analytics', content: 'Charts and insights about your data trends.' },
    { header: 'Settings', content: 'Configure preferences and manage your account.' },
];

const StyleVariants: React.FC = () => {
    const [indices, setIndices] = useState<Record<string, number>>({});

    const getIndex = (variant: string) => indices[variant] ?? 0;
    const setIndex = (variant: string, idx: number) => setIndices((prev) => ({ ...prev, [variant]: idx }));

    return (
        <>
            <div className="space-y-6">
                {variants.map(({ name, variant, description }) => (
                    <ComponentDemo key={variant} title={name} description={description}>
                        <TabView
                            variant={variant}
                            activeIndex={getIndex(variant)}
                            onTabChange={(e) => setIndex(variant, e.index)}
                        >
                            {tabContent.map((tab) => (
                                <TabPage key={tab.header} header={tab.header}>
                                    <div className="p-4"><p>{tab.content}</p></div>
                                </TabPage>
                            ))}
                        </TabView>
                    </ComponentDemo>
                ))}
            </div>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default StyleVariants;
