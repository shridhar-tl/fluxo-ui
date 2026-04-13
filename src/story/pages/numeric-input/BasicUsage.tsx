import React, { useState } from 'react';
import { NumericInput as NumericInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const NumericInput = withFieldLabel(NumericInputRaw);

const code = `import { NumericInput } from 'ether-ui';

function MyComponent() {
  const [value, setValue] = useState(0);

  return (
    <NumericInput
      label="Quantity"
      value={value}
      onChange={setValue}
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const [basicValue, setBasicValue] = useState(0);

    return (
        <>
            <ComponentDemo title="Basic Numeric Input">
                <div className="w-full max-w-sm">
                    <NumericInput label="Quantity" value={basicValue} onChange={(e) => setBasicValue(e.value)} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
