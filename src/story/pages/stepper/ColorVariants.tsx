import cn from 'classnames';
import React from 'react';
import { Stepper } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicSteps } from './stepper-story-data';

const variants = ['primary', 'success', 'warning', 'danger', 'info', 'default'] as const;

const ColorVariants: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Color Variants" description="Different color themes for the stepper" centered={false}>
            <div className="w-full space-y-6 p-4">
                {variants.map((v) => (
                    <div key={v}>
                        <p className={cn('text-sm mb-2 font-medium capitalize', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>{v}</p>
                        <Stepper steps={basicSteps} activeStep={2} variant={v} layout="rounded" />
                    </div>
                ))}
            </div>
        </ComponentDemo>
    );
};

export default ColorVariants;
