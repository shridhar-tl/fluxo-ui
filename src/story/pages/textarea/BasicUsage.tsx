import React, { useState } from 'react';
import { TextArea as TextAreaRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextArea = withFieldLabel(TextAreaRaw);

const code = `import { TextArea } from 'fluxo-ui';

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <TextArea
      label="Description"
      placeholder="Enter your description..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const [basicValue, setBasicValue] = useState('');

    return (
        <>
            <ComponentDemo title="Basic TextArea">
                <div className="w-full max-w-sm">
                    <TextArea
                        label="Description"
                        placeholder="Enter your description..."
                        value={basicValue}
                        onChange={(e) => setBasicValue(e.value)}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
