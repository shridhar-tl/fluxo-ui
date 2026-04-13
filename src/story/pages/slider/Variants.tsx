import React from 'react';
import type { SliderVariant } from '../../../components';
import { Slider } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Slider } from 'fluxo-ui';
import type { SliderVariant } from 'fluxo-ui';

const variants: SliderVariant[] = [
  'default', 'primary', 'success', 'warning', 'danger', 'info'
];

{variants.map((variant) => (
  <Slider key={variant} variant={variant} defaultValue={60} />
))}`;

const variants: { variant: SliderVariant; label: string; defaultVal: number }[] = [
    { variant: 'default', label: 'Default', defaultVal: 45 },
    { variant: 'primary', label: 'Primary', defaultVal: 55 },
    { variant: 'success', label: 'Success', defaultVal: 65 },
    { variant: 'warning', label: 'Warning', defaultVal: 50 },
    { variant: 'danger', label: 'Danger', defaultVal: 40 },
    { variant: 'info', label: 'Info', defaultVal: 70 },
];

const Variants: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Color Variants" description="Six color variants for different semantic purposes.">
                <div className="space-y-6 w-full max-w-lg">
                    {variants.map(({ variant, label, defaultVal }) => (
                        <div key={variant}>
                            <div className="text-sm mb-2 opacity-70">{label}</div>
                            <Slider variant={variant} defaultValue={defaultVal} showTooltip />
                        </div>
                    ))}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Variants;
