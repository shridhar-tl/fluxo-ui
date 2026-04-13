import React, { useState } from 'react';
import { Slider } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Slider } from 'ether-ui';

<Slider
  orientation="vertical"
  defaultValue={60}
  showTooltip
/>

<Slider
  orientation="vertical"
  range
  defaultRangeValue={[20, 80]}
  showTooltip="always"
  variant="success"
/>`;

const VerticalSlider: React.FC = () => {
    const [value, setValue] = useState(60);

    return (
        <>
            <ComponentDemo title="Vertical Orientation" description="Set orientation to vertical for a top-to-bottom slider.">
                <div className="flex flex-wrap gap-8 md:gap-12 items-end" style={{ height: 250 }}>
                    <div className="flex flex-col items-center gap-2">
                        <Slider
                            orientation="vertical"
                            value={value}
                            onChange={(v) => setValue(v as number)}
                            showTooltip
                        />
                        <span className="text-xs opacity-70">Default</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Slider
                            orientation="vertical"
                            defaultValue={40}
                            variant="success"
                            showTooltip
                            showMinMax
                        />
                        <span className="text-xs opacity-70">Success</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Slider
                            orientation="vertical"
                            defaultValue={75}
                            variant="warning"
                            size="lg"
                            showTooltip
                        />
                        <span className="text-xs opacity-70">Large</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Slider
                            orientation="vertical"
                            range
                            defaultRangeValue={[20, 80]}
                            variant="info"
                            showTooltip="always"
                        />
                        <span className="text-xs opacity-70">Range</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Slider
                            orientation="vertical"
                            defaultValue={50}
                            disabled
                        />
                        <span className="text-xs opacity-70">Disabled</span>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default VerticalSlider;
