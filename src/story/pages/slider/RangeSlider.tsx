import React, { useState } from 'react';
import { Slider } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Slider } from 'ether-ui';

const [range, setRange] = useState<[number, number]>([20, 80]);

<Slider
  range
  rangeValue={range}
  onChange={(v) => setRange(v as [number, number])}
  showTooltip="always"
  showMinMax
/>

<Slider
  range
  defaultRangeValue={[1000, 5000]}
  min={0}
  max={10000}
  step={100}
  showValue
  valuePosition="top"
  valueFormat={(v) => \`$\${v.toLocaleString()}\`}
/>`;

const RangeSlider: React.FC = () => {
    const [range, setRange] = useState<[number, number]>([20, 80]);
    const [priceRange, setPriceRange] = useState<[number, number]>([1000, 5000]);

    return (
        <>
            <ComponentDemo title="Range Slider" description="Use the range prop for dual-thumb selection of a value range.">
                <div className="space-y-8 w-full max-w-lg">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Basic range ({range[0]} - {range[1]})</div>
                        <Slider
                            range
                            rangeValue={range}
                            onChange={(v) => setRange(v as [number, number])}
                            showTooltip="always"
                            showMinMax
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Price range filter</div>
                        <Slider
                            range
                            rangeValue={priceRange}
                            onChange={(v) => setPriceRange(v as [number, number])}
                            min={0}
                            max={10000}
                            step={100}
                            showValue
                            valuePosition="top"
                            valueFormat={(v) => `$${v.toLocaleString()}`}
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Range with marks</div>
                        <Slider
                            range
                            defaultRangeValue={[25, 75]}
                            marks
                            step={25}
                            showTooltip
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default RangeSlider;
