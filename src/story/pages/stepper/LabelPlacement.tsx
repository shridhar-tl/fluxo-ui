import cn from 'classnames';
import React from 'react';
import { Stepper } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicSteps } from './stepper-story-data';

const placements = [
    { key: 'bottom', label: 'Bottom (default)' },
    { key: 'right', label: 'Right' },
    { key: 'alternate', label: 'Alternate' },
] as const;

const LabelPlacement: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Label Positions" description="Labels positioned below, to the right, or alternating" centered={false}>
            <div className="w-full space-y-8 p-4">
                {placements.map(({ key, label }) => (
                    <div key={key}>
                        <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>{label}</p>
                        <Stepper steps={basicSteps} activeStep={1} labelPlacement={key} layout="rounded" />
                    </div>
                ))}
            </div>
        </ComponentDemo>
    );
};

export default LabelPlacement;
