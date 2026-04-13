import React, { useState } from 'react';
import { TextInput as TextInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextInput = withFieldLabel(TextInputRaw);

const code = `import { TextInput } from 'ether-ui';

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <TextInput
      placeholder="Enter some text..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const [basicValue, setBasicValue] = useState('');

    return (
        <>
            <ComponentDemo title="Basic Text Input">
                <div className="w-full max-w-sm">
                    <TextInput placeholder="Enter some text..." value={basicValue} onChange={(e) => setBasicValue(e.value)} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
