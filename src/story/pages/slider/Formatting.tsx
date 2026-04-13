import React, { useState } from 'react';
import { Slider } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Slider } from 'fluxo-ui';

// Currency formatting
<Slider
  min={0}
  max={1000}
  step={10}
  defaultValue={500}
  showTooltip="always"
  tooltipFormat={(v) => \`$\${v}\`}
  valueFormat={(v) => \`$\${v.toLocaleString()}\`}
  showValue
  valuePosition="top"
/>

// Percentage formatting
<Slider
  defaultValue={65}
  showTooltip="always"
  tooltipFormat={(v) => \`\${v}%\`}
  showMinMax
/>

// Temperature with unit
<Slider
  min={-20}
  max={50}
  defaultValue={22}
  showTooltip
  tooltipFormat={(v) => \`\${v}°F\`}
  showValue
  valuePosition="right"
  valueFormat={(v) => \`\${v}°F\`}
/>`;

const Formatting: React.FC = () => {
    const [currency, setCurrency] = useState(500);
    const [percent, setPercent] = useState(65);

    return (
        <>
            <ComponentDemo title="Value Formatting" description="Use tooltipFormat and valueFormat to customize how values are displayed.">
                <div className="space-y-10 w-full max-w-lg">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Currency format</div>
                        <Slider
                            min={0}
                            max={1000}
                            step={10}
                            value={currency}
                            onChange={(v) => setCurrency(v as number)}
                            showTooltip="always"
                            tooltipFormat={(v) => `$${v}`}
                            valueFormat={(v) => `$${v.toLocaleString()}`}
                            showValue
                            valuePosition="top"
                            variant="success"
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Percentage format</div>
                        <Slider
                            value={percent}
                            onChange={(v) => setPercent(v as number)}
                            showTooltip="always"
                            tooltipFormat={(v) => `${v}%`}
                            showMinMax
                            variant="primary"
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Temperature with unit</div>
                        <Slider
                            min={-20}
                            max={50}
                            defaultValue={22}
                            showTooltip
                            tooltipFormat={(v) => `${v}\u00B0F`}
                            showValue
                            valuePosition="right"
                            valueFormat={(v) => `${v}\u00B0F`}
                            variant="danger"
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Time duration (minutes)</div>
                        <Slider
                            min={0}
                            max={120}
                            step={5}
                            defaultValue={45}
                            showTooltip="always"
                            tooltipFormat={(v) => {
                                const hrs = Math.floor(v / 60);
                                const mins = v % 60;
                                return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                            }}
                            showValue
                            valuePosition="top"
                            valueFormat={(v) => {
                                const hrs = Math.floor(v / 60);
                                const mins = v % 60;
                                return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                            }}
                            variant="info"
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

export default Formatting;
