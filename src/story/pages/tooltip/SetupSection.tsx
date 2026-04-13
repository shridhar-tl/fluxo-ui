import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const code = `import { TooltipManager } from 'ether-ui';

function App() {
  return (
    <>
      <TooltipManager />
      {/* rest of app */}
    </>
  );
}`;

const SetupSection: React.FC = () => {
    return (
        <CodeBlock title="App root" code={code} />
    );
};

export default SetupSection;
