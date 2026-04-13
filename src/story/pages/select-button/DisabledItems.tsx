import React from 'react';
import { SelectButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { disabledItemsOptions } from './select-button-story-data';

const code = `const options = [
  { label: 'Available', value: 'available' },
  { label: 'Disabled', value: 'disabled', disabled: true },
  { label: 'Also Available', value: 'available2' },
];

<SelectButton
  items={options}
  value={value}
  onChange={(e) => setValue(e.value)}
/>`;

const DisabledItems: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Specific Items Disabled">
                <SelectButton items={disabledItemsOptions} value="available" onChange={(e) => console.log('Selected:', e.value)} />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default DisabledItems;
