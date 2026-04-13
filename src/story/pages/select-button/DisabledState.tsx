import React from 'react';
import { SelectButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicOptions } from './select-button-story-data';

const code = `<SelectButton
  items={options}
  value={value}
  onChange={(e) => setValue(e.value)}
  disabled
/>`;

const DisabledState: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Fully Disabled">
                <SelectButton items={basicOptions} value="option2" disabled />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default DisabledState;
