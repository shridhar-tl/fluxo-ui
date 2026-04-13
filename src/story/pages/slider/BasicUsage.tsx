import React, { useState } from 'react';
import { Slider } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Slider } from 'ether-ui';

const [value, setValue] = useState(40);

<Slider
  value={value}
  onChange={(v) => setValue(v as number)}
  showTooltip
/>

<Slider defaultValue={60} showMinMax />

<Slider defaultValue={25} showValue valuePosition="right" />`;

const BasicUsage: React.FC = () => {
    const [value, setValue] = useState(40);

    return (
        <>
            <ComponentDemo title="Default Slider" description="A simple slider with controlled value and tooltip on hover.">
                <div className="space-y-8 w-full max-w-lg">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Controlled with tooltip (value: {value})</div>
                        <Slider
                            value={value}
                            onChange={(v) => setValue(v as number)}
                            showTooltip
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Uncontrolled with min/max labels</div>
                        <Slider defaultValue={60} showMinMax />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">With value display on the right</div>
                        <Slider defaultValue={25} showValue valuePosition="right" />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Disabled slider</div>
                        <Slider defaultValue={50} disabled showMinMax />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
