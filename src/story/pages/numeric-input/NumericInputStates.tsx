import React, { useState } from 'react';
import { NumericInput as NumericInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const NumericInput = withFieldLabel(NumericInputRaw);

const code = `<NumericInput label="Normal" value={42} onChange={setValue} />
<NumericInput label="Disabled" value={42} onChange={setValue} disabled />
<NumericInput label="Read Only" value={42} readonly />
<NumericInput label="With Error" error="Value must be positive" value={value} onChange={setValue} />`;

const NumericInputStates: React.FC = () => {
    const [errorValue, setErrorValue] = useState(-5);
    const errorMessage = errorValue < 0 ? 'Value must be positive' : undefined;

    return (
        <>
            <ComponentDemo title="Input States">
                <div className="w-full max-w-sm space-y-4">
                    <NumericInput label="Normal" value={42} onChange={() => {}} />
                    <NumericInput label="Disabled" value={42} onChange={() => {}} disabled />
                    <NumericInput label="Read Only" value={42} readonly />
                    <NumericInput label="With Error" error={errorMessage} value={errorValue} onChange={(e) => setErrorValue(e.value)} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default NumericInputStates;
