import React from 'react';
import { Slider } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Slider } from 'fluxo-ui';

// Auto-generated marks based on step
<Slider defaultValue={50} marks step={10} showTooltip />

// Custom marks with labels
<Slider
  defaultValue={37}
  min={0}
  max={100}
  marks={[
    { value: 0, label: '0°C' },
    { value: 25, label: '25°C' },
    { value: 37, label: '37°C' },
    { value: 50, label: '50°C' },
    { value: 75, label: '75°C' },
    { value: 100, label: '100°C' },
  ]}
  showTooltip
  variant="danger"
/>`;

const temperatureMarks = [
    { value: 0, label: '0\u00B0C' },
    { value: 25, label: '25\u00B0C' },
    { value: 37, label: '37\u00B0C' },
    { value: 50, label: '50\u00B0C' },
    { value: 75, label: '75\u00B0C' },
    { value: 100, label: '100\u00B0C' },
];

const percentMarks = [
    { value: 0, label: '0%' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' },
];

const WithMarks: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Slider with Marks"
                description="Display marks along the track using auto-generated or custom mark definitions."
            >
                <div className="space-y-10 w-full max-w-lg">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Auto marks (step=25)</div>
                        <Slider defaultValue={50} marks step={25} showTooltip />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Temperature marks</div>
                        <Slider
                            defaultValue={37}
                            min={0}
                            max={100}
                            marks={temperatureMarks}
                            showTooltip
                            variant="danger"
                            tooltipFormat={(v) => `${v}\u00B0C`}
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Percentage marks with range</div>
                        <Slider range defaultRangeValue={[25, 75]} marks={percentMarks} showTooltip variant="success" />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default WithMarks;
