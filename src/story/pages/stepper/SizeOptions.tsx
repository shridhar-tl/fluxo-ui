import cn from 'classnames';
import React from 'react';
import { Stepper } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicSteps } from './stepper-story-data';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const SizeOptions: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Size Options" description="Five sizes from xs to xl" centered={false}>
            <div className="w-full space-y-8 p-4">
                {sizes.map((s) => (
                    <div key={s}>
                        <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>{s.toUpperCase()}</p>
                        <Stepper steps={basicSteps} activeStep={1} size={s} layout="rounded" />
                    </div>
                ))}
            </div>
        </ComponentDemo>
    );
};

export default SizeOptions;
