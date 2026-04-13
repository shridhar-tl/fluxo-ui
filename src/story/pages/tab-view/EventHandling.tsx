import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const eventCode = `import { TabView, TabPage, TabChangeEvent, TabCloseEvent } from 'fluxo-ui';

function MyComponent() {
  const handleTabChange = (e: TabChangeEvent) => {
    console.log('Tab changed to index:', e.index);
  };

  const handleBeforeTabChange = (e: TabChangeEvent) => {
    if (e.index === 2) {
      alert('Cannot switch to this tab');
      return false;
    }
    return true;
  };

  const handleTabClose = (e: TabCloseEvent) => {
    console.log('Closing tab at index:', e.index);
  };

  return (
    <TabView
      onTabChange={handleTabChange}
      onBeforeTabChange={handleBeforeTabChange}
      onTabClose={handleTabClose}
    >
      <TabPage header="Allowed">Content 1</TabPage>
      <TabPage header="Allowed">Content 2</TabPage>
      <TabPage header="Restricted">Content 3</TabPage>
    </TabView>
  );
}`;

const EventHandling: React.FC = () => <CodeBlock code={eventCode} language="tsx" />;

export default EventHandling;
