import cn from 'classnames';
import React, { useState } from 'react';
import { Stepper } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { detailedSteps } from './stepper-story-data';

const InteractiveSteps: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [activeFree, setActiveFree] = useState(0);
    const [activeLinear, setActiveLinear] = useState(1);

    return (
        <ComponentDemo title="Clickable Steps" description="Click on steps to navigate" centered={false}>
            <div className="w-full space-y-8 p-4">
                <div>
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Free navigation</p>
                    <Stepper steps={detailedSteps} activeStep={activeFree} clickable onChange={setActiveFree} layout="rounded" />
                </div>
                <div>
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Linear (next step only)</p>
                    <Stepper steps={detailedSteps} activeStep={activeLinear} clickable linear onChange={setActiveLinear} layout="rounded" />
                    <button className={cn('mt-3 px-3 py-1.5 text-xs rounded-md', { 'bg-gray-700 text-gray-300': isDark, 'bg-gray-200 text-gray-600': !isDark })} onClick={() => setActiveLinear(0)}>Reset</button>
                </div>
            </div>
        </ComponentDemo>
    );
};

export default InteractiveSteps;
