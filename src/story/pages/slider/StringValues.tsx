import React, { useState } from 'react';
import { Slider } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Slider } from 'ether-ui';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

<Slider
  labels={months}
  defaultValue={3}
  marks
  showTooltip="always"
/>

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

<Slider
  labels={sizes}
  defaultValue={2}
  marks
  showValue
  valuePosition="top"
/>`;

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];

const StringValues: React.FC = () => {
    const [monthIndex, setMonthIndex] = useState(3);
    const [sizeIndex, setSizeIndex] = useState(2);

    return (
        <>
            <ComponentDemo title="String Labels" description="Use the labels prop to map slider positions to string values like months or sizes.">
                <div className="space-y-10 w-full max-w-lg">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Month selector (selected: {months[monthIndex]})</div>
                        <Slider
                            labels={months}
                            value={monthIndex}
                            onChange={(v) => setMonthIndex(v as number)}
                            marks
                            showTooltip="always"
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Clothing size (selected: {clothingSizes[sizeIndex]})</div>
                        <Slider
                            labels={clothingSizes}
                            value={sizeIndex}
                            onChange={(v) => setSizeIndex(v as number)}
                            marks
                            showValue
                            valuePosition="right"
                            variant="info"
                        />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Priority level</div>
                        <Slider
                            labels={priorities}
                            defaultValue={1}
                            marks
                            showTooltip
                            variant="warning"
                            size="lg"
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

export default StringValues;
