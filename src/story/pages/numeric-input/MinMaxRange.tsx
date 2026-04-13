import React, { useState } from 'react';
import { NumericInput as NumericInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const NumericInput = withFieldLabel(NumericInputRaw);

const code = `<NumericInput
  label="Score (0-100)"
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  placeholder="Enter score..."
/>`;

const MinMaxRange: React.FC = () => {
    const [rangeValue, setRangeValue] = useState(50);

    return (
        <>
            <ComponentDemo title="With Range Constraints">
                <div className="w-full max-w-sm">
                    <NumericInput
                        label="Score (0-100)"
                        value={rangeValue}
                        onChange={(e) => setRangeValue(e.value)}
                        min={0}
                        max={100}
                        placeholder="Enter score..."
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default MinMaxRange;
