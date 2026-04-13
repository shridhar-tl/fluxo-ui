import cn from 'classnames';
import React from 'react';
import { ToggleButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<ToggleButton checked={false} />
<ToggleButton checked={true} />
<ToggleButton checked={false} disabled />
<ToggleButton checked={true} disabled />`;

const States: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo title="Toggle Button States">
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <ToggleButton checked={false} />
                        <span className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Off State</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ToggleButton checked={true} />
                        <span className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>On State</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ToggleButton checked={false} disabled />
                        <span className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Disabled Off</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ToggleButton checked={true} disabled />
                        <span className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Disabled On</span>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default States;
