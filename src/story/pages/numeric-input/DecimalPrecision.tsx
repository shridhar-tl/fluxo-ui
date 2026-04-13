import React, { useState } from 'react';
import { NumericInput as NumericInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const NumericInput = withFieldLabel(NumericInputRaw);

const code = `<NumericInput
  label="Price ($)"
  value={value}
  onChange={setValue}
  maxDecimals={2}
  min={0}
/>`;

const DecimalPrecision: React.FC = () => {
    const [decimalValue, setDecimalValue] = useState(12.34);

    return (
        <>
            <ComponentDemo title="With Decimal Places">
                <div className="w-full max-w-sm">
                    <NumericInput
                        label="Price ($)"
                        value={decimalValue}
                        onChange={(e) => setDecimalValue(e.value)}
                        maxDecimals={2}
                        min={0}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default DecimalPrecision;
