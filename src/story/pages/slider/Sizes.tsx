import React from 'react';
import { Slider } from '../../../components';
import type { SliderSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Slider } from 'ether-ui';
import type { SliderSize } from 'ether-ui';

const sizes: SliderSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

{sizes.map((size) => (
  <Slider key={size} size={size} defaultValue={50} showTooltip />
))}`;

const sizes: { size: SliderSize; label: string }[] = [
    { size: 'xs', label: 'Extra Small' },
    { size: 'sm', label: 'Small' },
    { size: 'md', label: 'Medium (default)' },
    { size: 'lg', label: 'Large' },
    { size: 'xl', label: 'Extra Large' },
];

const Sizes: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Slider Sizes" description="Five size options control the track height, thumb size, and font size.">
                <div className="space-y-6 w-full max-w-lg">
                    {sizes.map(({ size, label }) => (
                        <div key={size}>
                            <div className="text-sm mb-2 opacity-70">{label} ({size})</div>
                            <Slider
                                size={size}
                                defaultValue={50}
                                showTooltip
                                showMinMax
                            />
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

export default Sizes;
