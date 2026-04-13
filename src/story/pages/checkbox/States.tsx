import React from 'react';
import { Checkbox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Checkbox label="Normal checkbox" checked={false} onChange={handleChange} />
<Checkbox label="Checked checkbox" checked={true} onChange={handleChange} />
<Checkbox label="Disabled unchecked" disabled checked={false} onChange={handleChange} />
<Checkbox label="Disabled checked" disabled checked={true} onChange={handleChange} />
<Checkbox label="Required checkbox" required />
<Checkbox label="Indeterminate" indeterminate />`;

const States: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Checkbox States">
                <div className="space-y-4">
                    <Checkbox label="Normal checkbox" checked={false} onChange={() => {}} />
                    <Checkbox label="Checked checkbox" checked={true} onChange={() => {}} />
                    <Checkbox label="Disabled unchecked" disabled checked={false} onChange={() => {}} />
                    <Checkbox label="Disabled checked" disabled checked={true} onChange={() => {}} />
                    <Checkbox label="Required checkbox" required checked={false} onChange={() => {}} />
                    <Checkbox label="Indeterminate" indeterminate />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default States;
