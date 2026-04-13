import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const code = `function PersistentSplitter() {
  const storageKey = 'my-splitter-size';

  const savedSize = (() => {
    const v = localStorage.getItem(storageKey);
    return v ? \`\${v}px\` : '300px';
  })();

  return (
    <Splitter
      style={{ height: '400px' }}
      onResizeEnd={(size) => {
        localStorage.setItem(storageKey, String(Math.round(size)));
      }}
    >
      <SplitterPanel defaultSize={savedSize} minSize="100px">
        <div className="p-4">Sidebar — size restored on reload</div>
      </SplitterPanel>
      <SplitterPanel minSize="200px">
        <div className="p-4">Main content</div>
      </SplitterPanel>
    </Splitter>
  );
}`;

const PersistingLayout: React.FC = () => {
    return (
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    );
};

export default PersistingLayout;
