import React, { useState } from 'react';
import { Dropdown as DropdownRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { customFieldOptions } from './dropdown-story-data';

const Dropdown = withFieldLabel(DropdownRaw);

const code = `const countries = [
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'United Kingdom', code: 'UK' },
  { name: 'Germany', code: 'DE' },
];

<Dropdown
  label="Country"
  placeholder="Select a country..."
  options={countries}
  optionLabel="name"
  optionValue="code"
  value={value}
  onChange={setValue}
/>`;

const CustomFieldMapping: React.FC = () => {
    const [customFieldValue, setCustomFieldValue] = useState('');

    return (
        <>
            <ComponentDemo title="Dropdown with optionLabel / optionValue">
                <div className="w-full max-w-sm">
                    <Dropdown
                        label="Country"
                        placeholder="Select a country..."
                        options={customFieldOptions}
                        optionLabel="name"
                        optionValue="code"
                        value={customFieldValue}
                        onChange={(e) => setCustomFieldValue(e.value)}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default CustomFieldMapping;
