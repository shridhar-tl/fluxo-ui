import React, { useState } from 'react';
import { TabPage, TabView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TabView scrollable activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
  <TabPage header="Home">Home content</TabPage>
  <TabPage header="Products">Products content</TabPage>
  <TabPage header="Services">Services content</TabPage>
  <TabPage header="About">About content</TabPage>
  <TabPage header="Contact">Contact content</TabPage>
  <TabPage header="Support">Support content</TabPage>
  <TabPage header="Documentation">Docs content</TabPage>
</TabView>`;

const tabNames = ['Home', 'Products', 'Services', 'About Us', 'Contact', 'Support', 'Documentation', 'Blog'];

const ScrollableTabs: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <>
            <ComponentDemo title="Scrollable Tabs" description="Tab navigation with scroll arrows when tabs overflow">
                <div className="w-full max-w-md">
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} scrollable>
                        {tabNames.map((name) => (
                            <TabPage key={name} header={name}>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2">{name}</h3>
                                    <p>{name} page content goes here.</p>
                                </div>
                            </TabPage>
                        ))}
                    </TabView>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ScrollableTabs;
