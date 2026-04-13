import React from 'react';
import { Multiselect as MultiselectRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { colorOptions } from './multiselect-story-data';

const Multiselect = withFieldLabel(MultiselectRaw);

const code = `<Multiselect label="Normal" placeholder="Normal state" options={options} />
<Multiselect label="With Selections" options={options} value={['red', 'blue']} onChange={setValues} />
<Multiselect label="Disabled" placeholder="Disabled state" options={options} disabled />
<Multiselect label="Read Only" options={options} value={['green', 'yellow']} readonly />
<Multiselect label="Required" placeholder="Required field" options={options} required />
<Multiselect label="With Error" options={options} error="Please select at least one option" />`;

const MultiselectStates: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Multiselect States">
                <div className="w-full max-w-sm space-y-4">
                    <Multiselect label="Normal" placeholder="Normal state" options={colorOptions} />
                    <Multiselect label="With Selections" options={colorOptions} value={['red', 'blue']} />
                    <Multiselect label="Disabled" placeholder="Disabled state" options={colorOptions} disabled />
                    <Multiselect label="Required" placeholder="Required field" options={colorOptions} required />
                    <Multiselect
                        label="With Error"
                        placeholder="Select at least one"
                        options={colorOptions}
                        error="Please select at least one option"
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default MultiselectStates;
