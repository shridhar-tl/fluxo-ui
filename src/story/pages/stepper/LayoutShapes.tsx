import cn from 'classnames';
import React from 'react';
import { Stepper } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicSteps } from './stepper-story-data';

const layouts = [
    { key: 'default', label: 'Default (Rounded Rect)' },
    { key: 'rounded', label: 'Rounded (Circle)' },
    { key: 'square', label: 'Square' },
    { key: 'rectangle', label: 'Rectangle (Pill)' },
    { key: 'dot', label: 'Dot' },
    { key: 'minimal', label: 'Minimal' },
] as const;

const LayoutShapes: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Indicator Shapes" description="Different shapes for step indicators" centered={false}>
            <div className="w-full space-y-8 p-4">
                {layouts.map(({ key, label }) => (
                    <div key={key}>
                        <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>{label}</p>
                        <Stepper steps={basicSteps} activeStep={1} layout={key} />
                    </div>
                ))}
            </div>
        </ComponentDemo>
    );
};

export default LayoutShapes;
