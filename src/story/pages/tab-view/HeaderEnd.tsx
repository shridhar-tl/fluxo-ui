import React, { useState } from 'react';
import { TabPage, TabView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TabView
  headerEnd={<button className="...">+ Add Tab</button>}
>
  <TabPage header="Tab 1">Content</TabPage>
  <TabPage header="Tab 2">Content</TabPage>
</TabView>`;

const HeaderEnd: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <>
            <ComponentDemo title="Header End Content" description="Custom content in the tab header row's trailing space">
                <TabView
                    activeIndex={activeIndex}
                    onTabChange={(e) => setActiveIndex(e.index)}
                    headerEnd={
                        <div className="flex items-center gap-2">
                            <button className="px-2 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600">+ New</button>
                            <button className="px-2 py-1 text-xs rounded-md border border-current opacity-60 hover:opacity-100">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                                </svg>
                            </button>
                        </div>
                    }
                >
                    <TabPage header="Overview">
                        <div className="p-4"><p>Overview content with a trailing action button.</p></div>
                    </TabPage>
                    <TabPage header="Details">
                        <div className="p-4"><p>Details content.</p></div>
                    </TabPage>
                    <TabPage header="History">
                        <div className="p-4"><p>History content.</p></div>
                    </TabPage>
                </TabView>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default HeaderEnd;
