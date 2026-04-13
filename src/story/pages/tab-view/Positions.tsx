import React, { useState } from 'react';
import { TabPage, TabView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TabView position="left">
  <TabPage header="Profile">Profile content</TabPage>
  <TabPage header="Account">Account content</TabPage>
  <TabPage header="Security">Security content</TabPage>
</TabView>

<TabView position="right">...</TabView>
<TabView position="bottom">...</TabView>`;

const tabs = ['Profile', 'Account', 'Security'];

const Positions: React.FC = () => {
    const [leftIdx, setLeftIdx] = useState(0);
    const [rightIdx, setRightIdx] = useState(0);
    const [bottomIdx, setBottomIdx] = useState(0);

    const renderContent = (name: string) => (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{name}</h3>
            <p>Manage your {name.toLowerCase()} information and preferences.</p>
        </div>
    );

    return (
        <>
            <div className="space-y-6">
                <ComponentDemo title="Left Position" description="Tab headers positioned on the left side">
                    <div className="h-48">
                        <TabView activeIndex={leftIdx} onTabChange={(e) => setLeftIdx(e.index)} position="left">
                            {tabs.map((t) => (
                                <TabPage key={t} header={t}>{renderContent(t)}</TabPage>
                            ))}
                        </TabView>
                    </div>
                </ComponentDemo>

                <ComponentDemo title="Right Position" description="Tab headers positioned on the right side">
                    <div className="h-48">
                        <TabView activeIndex={rightIdx} onTabChange={(e) => setRightIdx(e.index)} position="right">
                            {tabs.map((t) => (
                                <TabPage key={t} header={t}>{renderContent(t)}</TabPage>
                            ))}
                        </TabView>
                    </div>
                </ComponentDemo>

                <ComponentDemo title="Bottom Position" description="Tab headers at the bottom">
                    <TabView activeIndex={bottomIdx} onTabChange={(e) => setBottomIdx(e.index)} position="bottom">
                        {tabs.map((t) => (
                            <TabPage key={t} header={t}>{renderContent(t)}</TabPage>
                        ))}
                    </TabView>
                </ComponentDemo>
            </div>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Positions;
