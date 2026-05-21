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

const defaultsCode = `// Set app-wide defaults once; any showSnackbar() call can still override them
<SnackbarManager defaultOptions={{ variant: 'soft', size: 'sm', position: 'bottomRight' }} />

// Uses the manager defaults (soft, sm, bottomRight)
showSnackbar('Saved');

// Overrides size + position just for this call
showSnackbar('Upload failed', 'Error', { type: 'error', size: 'md', position: 'topCenter' });`;

const SetupSection: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <CodeBlock title="App root" code={code} />
            <CodeBlock title="Manager defaults (overridable per call)" code={defaultsCode} />
        </div>
    );
};

export default SetupSection;
