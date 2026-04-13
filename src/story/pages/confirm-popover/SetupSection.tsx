import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const code = `import { ConfirmPopoverManager } from 'fluxo-ui';

function App() {
  return (
    <>
      <ConfirmPopoverManager />
      {/* rest of app */}
    </>
  );
}`;

const SetupSection: React.FC = () => {
    return <CodeBlock title="App root" code={code} />;
};

export default SetupSection;
