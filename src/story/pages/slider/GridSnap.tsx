import React, { useState } from 'react';
import { Slider } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Slider } from 'ether-ui';

// Snap to step with smooth animation
<Slider
  defaultValue={50}
  snap
  step={10}
  marks
  showTooltip
/>

// Grid step with custom duration
<Slider
  defaultValue={0}
  gridStep={25}
  gridDuration={200}
  marks
  showTooltip="always"
  variant="success"
/>`;

const GridSnap: React.FC = () => {
    const [snapValue, setSnapValue] = useState(50);
    const [gridValue, setGridValue] = useState(0);

    return (
        <>
            <ComponentDemo title="Grid & Snap Behavior" description="Enable snap for step-based snapping, or use gridStep for coarser grid alignment with animated transitions.">
                <div className="space-y-10 w-full max-w-lg">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Snap to step=10 (value: {snapValue})</div>
                        <Slider
                            value={snapValue}
                            onChange={(v) => setSnapValue(v as number)}
                            snap
                            step={10}
                            marks
                            showTooltip
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Grid step=25 with animation (value: {gridValue})</div>
                        <Slider
                            value={gridValue}
                            onChange={(v) => setGridValue(v as number)}
                            gridStep={25}
                            gridDuration={200}
                            marks
                            showTooltip="always"
                            variant="success"
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Snap to step=5 with no fill</div>
                        <Slider
                            defaultValue={30}
                            snap
                            step={5}
                            marks
                            filled={false}
                            showTooltip
                            variant="info"
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Grid step=20, range mode</div>
                        <Slider
                            range
                            defaultRangeValue={[20, 60]}
                            gridStep={20}
                            gridDuration={150}
                            marks
                            showTooltip="always"
                            variant="warning"
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

export default GridSnap;
