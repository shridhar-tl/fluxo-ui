import React, { useState } from 'react';
import { Multiselect as MultiselectRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { countryOptions } from './multiselect-story-data';

const Multiselect = withFieldLabel(MultiselectRaw);

const code = `const countries = [
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'United Kingdom', code: 'UK' },
  { name: 'Germany', code: 'DE' },
];

<Multiselect
  label="Countries"
  placeholder="Select countries..."
  options={countries}
  optionLabel="name"
  optionValue="code"
  value={values}
  onChange={setValues}
/>`;

const CustomFieldMapping: React.FC = () => {
    const [customFieldValues, setCustomFieldValues] = useState<string[]>(['US', 'DE']);

    return (
        <>
            <ComponentDemo title="Multiselect with optionLabel / optionValue">
                <div className="w-full max-w-sm">
                    <Multiselect
                        label="Countries"
                        placeholder="Select countries..."
                        options={countryOptions}
                        optionLabel="name"
                        optionValue="code"
                        value={customFieldValues}
                        onChange={(e) => setCustomFieldValues(e.value)}
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
