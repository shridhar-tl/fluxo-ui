import React, { useState } from 'react';
import { TabPage, TabView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TabView
  activeIndex={activeIndex}
  onTabChange={(e) => setActiveIndex(e.index)}
  onTabClose={(e) => {
    setTabs(tabs.filter((_, i) => i !== e.index));
    if (e.index <= activeIndex) setActiveIndex(Math.max(0, activeIndex - 1));
  }}
>
  {tabs.map((tab) => (
    <TabPage key={tab} header={tab} closable>
      Content of {tab}
    </TabPage>
  ))}
</TabView>`;

const initialTabs = ['index.tsx', 'App.tsx', 'utils.ts', 'styles.css', 'README.md'];

const ClosableTabs: React.FC = () => {
    const [tabs, setTabs] = useState(initialTabs);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleClose = (index: number) => {
        const newTabs = tabs.filter((_, i) => i !== index);
        setTabs(newTabs);
        if (index <= activeIndex && activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        } else if (index < activeIndex) {
            setActiveIndex(activeIndex - 1);
        }
    };

    const handleReset = () => {
        setTabs(initialTabs);
        setActiveIndex(0);
    };

    return (
        <>
            <ComponentDemo title="Closable Tabs" description="Tabs with close buttons for dynamic tab management">
                <div className="w-full">
                    <TabView
                        activeIndex={activeIndex}
                        onTabChange={(e) => setActiveIndex(e.index)}
                        onTabClose={(e) => handleClose(e.index)}
                    >
                        {tabs.map((tab) => (
                            <TabPage key={tab} header={tab} closable>
                                <div className="p-4">
                                    <p>Content of <strong>{tab}</strong></p>
                                </div>
                            </TabPage>
                        ))}
                    </TabView>
                    {tabs.length === 0 && (
                        <div className="p-4 text-center">
                            <p className="mb-3 opacity-60">All tabs closed</p>
                            <button className="px-3 py-1.5 text-sm rounded-md bg-blue-500 text-white" onClick={handleReset}>
                                Reset Tabs
                            </button>
                        </div>
                    )}
                    {tabs.length > 0 && tabs.length < initialTabs.length && (
                        <div className="mt-2 text-right">
                            <button className="px-2 py-1 text-xs rounded opacity-60 hover:opacity-100" onClick={handleReset}>
                                Reset
                            </button>
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ClosableTabs;
