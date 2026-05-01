import React, { useState } from 'react';
import { NumericInput as NumericInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const NumericInput = withFieldLabel(NumericInputRaw);

const code = `<NumericInput
  label="Quantity"
  value={value}
  onChange={(e) => setValue(e.value ?? 0)}
  showSteppers
  step={1}
  min={0}
  max={10}
/>

<NumericInput
  label="Price"
  value={price}
  onChange={(e) => setPrice(e.value ?? 0)}
  showSteppers
  step={0.5}
  maxDecimals={2}
/>`;

const Steppers: React.FC = () => {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(9.5);

    return (
        <>
            <ComponentDemo title="Visible Stepper Buttons" description="Set showSteppers to render inline up/down buttons. The step prop controls the increment.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
                    <NumericInput
                        label="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.value ?? 0)}
                        showSteppers
                        step={1}
                        min={0}
                        max={10}
                    />
                    <NumericInput
                        label="Price ($, step 0.5)"
                        value={price}
                        onChange={(e) => setPrice(e.value ?? 0)}
                        showSteppers
                        step={0.5}
                        maxDecimals={2}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default Steppers;
