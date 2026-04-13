import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const SetupSection: React.FC = () => {
    return (
        <CodeBlock
            title="App root"
            code={`import { ContextMenuManager } from 'fluxo-ui';

function App() {
  return (
    <>
      <ContextMenuManager />
      {/* rest of app */}
    </>
  );
}`}
        />
    );
};

export default SetupSection;
