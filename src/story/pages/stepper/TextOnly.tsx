import cn from 'classnames';
import React from 'react';
import { Stepper } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { detailedSteps } from './stepper-story-data';

const TextOnly: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Minimal & Dot Styles" description="Steps without numbers or icons, text labels only" centered={false}>
            <div className="w-full space-y-8 p-4">
                <div>
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Minimal (no background)</p>
                    <Stepper steps={detailedSteps} activeStep={2} layout="minimal" showStepNumbers={false} />
                </div>
                <div>
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Dot indicators</p>
                    <Stepper steps={detailedSteps} activeStep={2} layout="dot" showStepNumbers={false} />
                </div>
            </div>
        </ComponentDemo>
    );
};

export default TextOnly;
