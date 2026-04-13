import React, { useState } from 'react';
import { MultiStateCheckbox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicStates } from './multi-state-checkbox-story-data';

const code = `import { MultiStateCheckbox } from 'fluxo-ui';

const states = [
  { value: null, label: 'No Selection', icon: undefined },
  { value: 'yes', label: 'Yes', icon: CheckIcon },
  { value: 'no', label: 'No', icon: MinusIcon },
];

function MyComponent() {
  const [value, setValue] = useState(null);

  return (
    <MultiStateCheckbox
      items={states}
      value={value}
      onChange={(e) => setValue(e.value)}
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const [value, setValue] = useState<string | null>(null);

    return (
        <>
            <ComponentDemo title="Basic MultiStateCheckbox">
                <div className="flex flex-col gap-4">
                    <MultiStateCheckbox items={basicStates} value={value} onChange={(e) => setValue(e.value)} />
                    <p className="text-sm text-gray-500">
                        Current value: <strong>{value === null ? 'null' : String(value)}</strong>
                    </p>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
