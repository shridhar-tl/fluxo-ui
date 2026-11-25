import React, { useState } from 'react';

import { Alert, SelectButton } from '../../../components';
import type { AlertSize, AlertVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowStyle, stackStyle } from '../../demo-styles';
import { alertTypes, variantItems } from './alert-story-data';

const sizeItems = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
];

const VariantsDemo: React.FC = () => {
    const [variant, setVariant] = useState<AlertVariant>('left-accent');
    const [size, setSize] = useState<AlertSize>('md');

    const code = `<Alert variant="${variant}" size="${size}" type="success" title="Payment received" description="…" />`;

    return (
        <>
            <ComponentDemo title="Variants & Sizes" description="Six visual variants and three sizes. Every variant adapts to light and dark mode.">
                <div style={stackStyle}>
                    <div style={rowStyle}>
                        <SelectButton items={variantItems} value={variant} onChange={(event) => setVariant(event.value as AlertVariant)} ariaLabel="Variant" />
                        <SelectButton items={sizeItems} value={size} onChange={(event) => setSize(event.value as AlertSize)} ariaLabel="Size" />
                    </div>
                    {alertTypes.map((alert) => (
                        <Alert key={alert.type} type={alert.type} variant={variant} size={size} title={alert.title} description={alert.description} />
                    ))}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default VariantsDemo;
