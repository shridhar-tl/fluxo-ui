import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const code = `import { SnackbarManager } from 'fluxo-ui';

function App() {
  return (
    <>
      <SnackbarManager />
      {/* rest of app */}
    </>
  );
}`;

const SetupSection: React.FC = () => {
    return <CodeBlock title="App root" code={code} />;
};

export default SetupSection;
