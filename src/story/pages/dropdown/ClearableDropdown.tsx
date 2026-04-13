import React, { useState } from 'react';
import { Dropdown as DropdownRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { countryOptions } from './dropdown-story-data';

const Dropdown = withFieldLabel(DropdownRaw);

const code = `<Dropdown
  label="Country"
  options={countryOptions}
  value={value}
  onChange={setValue}
  showClear
/>`;

const ClearableDropdown: React.FC = () => {
    const [clearableValue, setClearableValue] = useState('option2');

    return (
        <>
            <ComponentDemo title="Dropdown with Clear Button">
                <div className="w-full max-w-sm">
                    <Dropdown
                        label="Country"
                        options={countryOptions}
                        value={clearableValue}
                        onChange={(e) => setClearableValue(e.value)}
                        showClear
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ClearableDropdown;
