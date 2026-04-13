import cn from 'classnames';
import React, { useState } from 'react';
import { InputSwitch } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const BasicUsage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [basicSwitch, setBasicSwitch] = useState(false);

    return (
        <ComponentDemo title="Basic Switch" description="Simple on/off toggle switch">
            <div className="flex items-center space-x-4">
                <InputSwitch checked={basicSwitch} onChange={(e) => setBasicSwitch(e.value)} />
                <span className={cn({ 'text-gray-300': isDark, 'text-gray-700': !isDark })}>{basicSwitch ? 'Enabled' : 'Disabled'}</span>
            </div>
        </ComponentDemo>
    );
};

export default BasicUsage;
