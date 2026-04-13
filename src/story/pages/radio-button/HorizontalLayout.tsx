import React, { useState } from 'react';
import { RadioButtonGroup as RadioButtonGroupRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { priorityOptions } from './radio-button-story-data';

const RadioButtonGroup = withFieldLabel(RadioButtonGroupRaw);

const HorizontalLayout: React.FC = () => {
    const [horizontalValue, setHorizontalValue] = useState('medium');

    return (
        <>
            <ComponentDemo title="Horizontal Radio Group">
                <div className="max-w-md">
                    <RadioButtonGroup
                        label="Priority Level"
                        items={priorityOptions}
                        value={horizontalValue}
                        onChange={(e) => setHorizontalValue(e.value)}
                        orientation="horizontal"
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
];

<RadioButtonGroup
  label="Priority Level"
  items={priorityOptions}
  value={value}
  onChange={setValue}
  orientation="horizontal"
/>`}
                />
            </div>
        </>
    );
};

export default HorizontalLayout;
