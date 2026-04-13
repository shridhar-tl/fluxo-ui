import React, { useState } from 'react';
import { TabPage, TabView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { TabView, TabPage } from 'fluxo-ui';

function MyComponent() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
      <TabPage header="Dashboard">Dashboard content</TabPage>
      <TabPage header="Analytics">Analytics content</TabPage>
      <TabPage header="Settings">Settings content</TabPage>
    </TabView>
  );
}`;

const BasicUsage: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <>
            <ComponentDemo title="Basic TabView" description="Simple tab navigation with multiple panels">
                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    <TabPage header="Dashboard">
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
                            <p>Welcome to the dashboard. Here you can see an overview of your data.</p>
                        </div>
                    </TabPage>
                    <TabPage header="Analytics">
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                            <p>View detailed analytics and reports about your performance.</p>
                        </div>
                    </TabPage>
                    <TabPage header="Settings">
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">Settings</h3>
                            <p>Configure your application settings and preferences.</p>
                        </div>
                    </TabPage>
                </TabView>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
