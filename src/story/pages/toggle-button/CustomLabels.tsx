import cn from 'classnames';
import React, { useState } from 'react';
import { ToggleButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<ToggleButton
  checked={checked}
  onChange={(e) => setChecked(e.value)}
  onLabel="Enabled"
  offLabel="Disabled"
/>`;

const CustomLabels: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [customLabelsToggle, setCustomLabelsToggle] = useState(false);

    return (
        <>
            <ComponentDemo title="Toggle Button with Custom Labels">
                <div className="flex flex-col items-center gap-4">
                    <ToggleButton
                        checked={customLabelsToggle}
                        onChange={(e) => setCustomLabelsToggle(e.value)}
                        onLabel="Enabled"
                        offLabel="Disabled"
                    />
                    <p className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Feature is {customLabelsToggle ? 'enabled' : 'disabled'}</p>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default CustomLabels;
