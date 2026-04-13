import cn from 'classnames';
import React, { useState } from 'react';
import { ToggleButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `const handleToggle = (e) => {
  console.log('Toggle value:', e.value);
  console.log('Toggle name:', e.name);
  console.log('Additional args:', e.args);
  console.log('Original event:', e.event);

  setChecked(e.value);
};

<ToggleButton
  checked={checked}
  onChange={handleToggle}
  name="feature-toggle"
  args={{ feature: 'example' }}
/>`;

const EventHandling: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [toggleValue, setToggleValue] = useState(false);

    return (
        <>
            <ComponentDemo title="Toggle with Event Logging">
                <div className="flex flex-col items-center gap-4 w-full">
                    <ToggleButton
                        checked={toggleValue}
                        onChange={(e) => {
                            console.log('Toggle changed:', e);
                            setToggleValue(e.value);
                        }}
                        onLabel="Active"
                        offLabel="Inactive"
                        name="feature-toggle"
                        args={{ feature: 'example' }}
                    />
                    <div className={cn('p-4 rounded-lg w-full max-w-md', { 'bg-gray-800': isDark, 'bg-gray-100': !isDark })}>
                        <p className={cn('text-sm mb-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Event details (check console):</p>
                        <pre className={cn('text-xs', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            {JSON.stringify(
                                {
                                    value: toggleValue,
                                    name: 'feature-toggle',
                                    args: { feature: 'example' },
                                },
                                null,
                                2
                            )}
                        </pre>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default EventHandling;
