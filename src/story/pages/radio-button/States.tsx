import React from 'react';
import { RadioButtonGroup as RadioButtonGroupRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { priorityOptions } from './radio-button-story-data';

const RadioButtonGroup = withFieldLabel(RadioButtonGroupRaw);

const States: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Radio Button States">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <RadioButtonGroup label="Normal State" items={priorityOptions} value="medium" />
                    <RadioButtonGroup label="Disabled State" items={priorityOptions} value="low" disabled />
                    <RadioButtonGroup label="Required Field" items={priorityOptions} />
                    <RadioButtonGroup label="With Error" items={priorityOptions} error="Please select an option" />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`<RadioButtonGroup
  label="Normal State"
  items={options}
  value="md"
/>
<RadioButtonGroup
  label="Disabled State"
  items={options}
  value="low"
  disabled
/>
<RadioButtonGroup
  label="Required Field"
  items={options}
  required
/>
<RadioButtonGroup
  label="With Error"
  items={options}
  error="Please select an option"
/>`}
                />
            </div>
        </>
    );
};

export default States;
