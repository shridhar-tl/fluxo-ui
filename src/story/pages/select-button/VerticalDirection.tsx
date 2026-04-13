import React, { useState } from 'react';
import { SelectButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { sizeOptions } from './select-button-story-data';

const code = `<SelectButton
  items={options}
  value={value}
  onChange={(e) => setValue(e.value)}
  direction="vertical"
/>`;

const VerticalDirection: React.FC = () => {
    const [verticalValue, setVerticalValue] = useState('medium');

    return (
        <>
            <ComponentDemo title="Vertical Layout">
                <SelectButton
                    items={sizeOptions}
                    value={verticalValue}
                    onChange={(e) => setVerticalValue(e.value)}
                    direction="vertical"
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default VerticalDirection;
