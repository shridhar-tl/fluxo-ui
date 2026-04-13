import React, { useState } from 'react';
import { Dropdown as DropdownRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicOptions } from './dropdown-story-data';

const Dropdown = withFieldLabel(DropdownRaw);

const code = `import { Dropdown } from 'ether-ui';

function MyComponent() {
  const [value, setValue] = useState('');

  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Disabled Option', value: 'disabled', disabled: true }
  ];

  return (
    <Dropdown
      label="Select an option"
      placeholder="Choose one..."
      options={options}
      value={value}
      onChange={setValue}
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const [basicValue, setBasicValue] = useState('');

    return (
        <>
            <ComponentDemo title="Basic Dropdown">
                <div className="w-full max-w-sm">
                    <Dropdown
                        label="Select an option"
                        placeholder="Choose one..."
                        options={basicOptions}
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
