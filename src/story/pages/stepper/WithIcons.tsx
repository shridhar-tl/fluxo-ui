import cn from 'classnames';
import React from 'react';
import { Stepper } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { iconSteps } from './stepper-story-data';

const WithIcons: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Icon Steps" description="Steps with custom icons for each step" centered={false}>
            <div className="w-full space-y-8 p-4">
                <div>
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Rounded with Icons</p>
                    <Stepper steps={iconSteps} activeStep={2} layout="rounded" showStepNumbers={false} />
                </div>
                <div>
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Square with Icons</p>
                    <Stepper steps={iconSteps} activeStep={2} layout="square" showStepNumbers={false} />
                </div>
                <div>
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Rectangle with Icons</p>
                    <Stepper steps={iconSteps} activeStep={2} layout="rectangle" showStepNumbers={false} />
                </div>
            </div>
        </ComponentDemo>
    );
};

export default WithIcons;
