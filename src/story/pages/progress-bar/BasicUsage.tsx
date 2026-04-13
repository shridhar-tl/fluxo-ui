import React from 'react';
import { ProgressBar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { ProgressBar } from 'fluxo-ui';

function MyComponent() {
  return (
    <div className="space-y-4">
      <ProgressBar value={25} />
      <ProgressBar value={50} />
      <ProgressBar value={75} />
      <ProgressBar value={100} />
    </div>
  );
}`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Basic Progress Bar" description="Simple progress bars with different values" centered={false}>
            <div className="space-y-6 w-full p-2">
                <ProgressBar value={25} />
                <ProgressBar value={50} />
                <ProgressBar value={75} />
                <ProgressBar value={100} />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
