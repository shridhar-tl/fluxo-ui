import React from 'react';
import { Dropdown as DropdownRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicOptions } from './dropdown-story-data';

const Dropdown = withFieldLabel(DropdownRaw);

const code = `<Dropdown label="Normal" placeholder="Normal state" options={options} />
<Dropdown label="Selected" options={options} value="option2" onChange={setValue} />
<Dropdown label="Disabled" placeholder="Disabled state" options={options} disabled />
<Dropdown label="Read Only" options={options} value="option1" readonly />
<Dropdown label="Required" placeholder="Required field" options={options} required />
<Dropdown label="With Error" options={options} error="This field is required" />`;

const DropdownStates: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Dropdown States">
                <div className="w-full max-w-sm space-y-4">
                    <Dropdown label="Normal" placeholder="Normal state" options={basicOptions} />
                    <Dropdown label="Selected" options={basicOptions} value="option2" />
                    <Dropdown label="Disabled" placeholder="Disabled state" options={basicOptions} disabled />
                    <Dropdown label="Read Only" options={basicOptions} value="option1" readOnly />
                    <Dropdown label="Required" placeholder="Required field" options={basicOptions} required />
                    <Dropdown label="With Error" placeholder="Select an option" options={basicOptions} error="This field is required" />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default DropdownStates;
