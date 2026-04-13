import cn from 'classnames';
import React from 'react';
import { InputSwitch } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const DisabledStates: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Disabled States" description="Switches in disabled state">
            <div className="flex items-center space-x-8">
                <div className="text-center">
                    <InputSwitch checked={false} disabled />
                    <p className={cn('text-sm mt-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Disabled Off</p>
                </div>
                <div className="text-center">
                    <InputSwitch checked={true} disabled />
                    <p className={cn('text-sm mt-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Disabled On</p>
                </div>
            </div>
        </ComponentDemo>
    );
};

export default DisabledStates;
