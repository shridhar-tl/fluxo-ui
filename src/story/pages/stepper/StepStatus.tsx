import cn from 'classnames';
import React from 'react';
import { Stepper } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { statusSteps, warningSteps } from './stepper-story-data';

const StepStatus: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Error & Warning States" description="Individual steps can have error or warning status" centered={false}>
            <div className="w-full space-y-8 p-4">
                <div>
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>With Error Step</p>
                    <Stepper steps={statusSteps} activeStep={1} layout="rounded" />
                </div>
                <div>
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>With Warning Step</p>
                    <Stepper steps={warningSteps} activeStep={2} layout="rounded" />
                </div>
            </div>
        </ComponentDemo>
    );
};

export default StepStatus;
