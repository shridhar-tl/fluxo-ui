import React, { useState } from 'react';

import { ChipGroup } from '../../../components';
import type { ChipValue } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowLabelStyle, stackStyle } from '../../demo-styles';
import { planOptions, sizeOptions } from './chip-story-data';

const code = `<ChipGroup
    value={plan}
    onChange={setPlan}
    required
    options={planOptions}
    variant="filled"
    ariaLabel="Billing period"
/>

<ChipGroup defaultValue="m" options={sizeOptions} shape="rounded" size="sm" ariaLabel="Size" />`;

const ChoiceChips: React.FC = () => {
    const [plan, setPlan] = useState<ChipValue | null>('yearly');
    const [size, setSize] = useState<ChipValue | null>('m');

    return (
        <>
            <ComponentDemo title="Choice Chips" description="Single selection behaves like a radio group. Required groups keep one chip selected.">
                <div style={stackStyle}>
                    <div style={stackStyle}>
                        <span style={rowLabelStyle}>Billing · required</span>
                        <ChipGroup value={plan} onChange={setPlan} required options={planOptions} variant="filled" color="primary" ariaLabel="Billing period" />
                    </div>
                    <div style={stackStyle}>
                        <span style={rowLabelStyle}>Size · deselectable</span>
                        <ChipGroup value={size} onChange={setSize} options={sizeOptions} shape="rounded" size="sm" variant="outlined" ariaLabel="Size" />
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        Plan: {plan ?? 'none'} · Size: {size ?? 'none'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ChoiceChips;
