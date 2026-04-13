import cn from 'classnames';
import React, { useState } from 'react';
import { RadioButtonGroup as RadioButtonGroupRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { priorityOptions } from './radio-button-story-data';

const RadioButtonGroup = withFieldLabel(RadioButtonGroupRaw);

const ControlledUncontrolled: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [horizontalValue, setHorizontalValue] = useState('medium');

    return (
        <>
            <ComponentDemo title="Controlled vs Uncontrolled">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className={cn('mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Controlled (with state)</h4>
                        <RadioButtonGroup
                            items={priorityOptions}
                            value={horizontalValue}
                            onChange={(e) => setHorizontalValue(e.value)}
                        />
                        <p className={cn('text-sm mt-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Selected: {horizontalValue}</p>
                    </div>
                    <div>
                        <h4 className={cn('mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Uncontrolled (default value)</h4>
                        <RadioButtonGroup items={priorityOptions} value="high" />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`// Controlled
const [value, setValue] = useState('medium');

<RadioButtonGroup
  items={options}
  value={value}
  onChange={setValue}
/>

// Uncontrolled
<RadioButtonGroup
  items={options}
  value="high"
/>`}
                />
            </div>
        </>
    );
};

export default ControlledUncontrolled;
