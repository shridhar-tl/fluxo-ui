import cn from 'classnames';
import React from 'react';
import { Stepper } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { detailedSteps, iconSteps } from './stepper-story-data';

const VerticalOrientation: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Vertical Orientation" description="Stepper in vertical layout">
            <div className="flex gap-12 flex-wrap">
                <div>
                    <p className={cn('text-sm mb-3 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Rounded</p>
                    <Stepper steps={detailedSteps} activeStep={1} orientation="vertical" layout="rounded" />
                </div>
                <div>
                    <p className={cn('text-sm mb-3 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>With Icons</p>
                    <Stepper steps={iconSteps.slice(0, 4)} activeStep={2} orientation="vertical" layout="rounded" showStepNumbers={false} />
                </div>
                <div>
                    <p className={cn('text-sm mb-3 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Dot</p>
                    <Stepper steps={detailedSteps} activeStep={2} orientation="vertical" layout="dot" showStepNumbers={false} />
                </div>
            </div>
        </ComponentDemo>
    );
};

export default VerticalOrientation;
