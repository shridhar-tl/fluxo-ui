import React, { useState } from 'react';
import { RadioButtonGroup as RadioButtonGroupRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicOptions } from './radio-button-story-data';

const RadioButtonGroup = withFieldLabel(RadioButtonGroupRaw);

const BasicUsage: React.FC = () => {
    const [basicValue, setBasicValue] = useState('option2');

    return (
        <>
            <ComponentDemo title="Basic Radio Button Group">
                <div className="max-w-xs">
                    <RadioButtonGroup
                        label="Choose an option"
                        items={basicOptions}
                        value={basicValue}
                        onChange={(e) => setBasicValue(e.value)}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    title="Basic Example"
                    code={`import { RadioButtonGroup } from 'fluxo-ui';

function MyComponent() {
  const [value, setValue] = useState('option2');

  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Disabled Option', value: 'disabled', disabled: true }
  ];

  return (
    <RadioButtonGroup
      label="Choose an option"
      items={options}
      value={value}
      onChange={setValue}
    />
  );
}`}
                />
            </div>
        </>
    );
};

export default BasicUsage;
