import cn from 'classnames';
import React, { useState } from 'react';
import { InputSwitch } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const SettingsPanel: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [premiumSwitch, setPremiumSwitch] = useState(true);
    const [notificationSwitch, setNotificationSwitch] = useState(false);

    return (
        <ComponentDemo title="Settings Panel" description="Multiple switches in a settings-like layout">
            <div className="space-y-4 w-full max-w-80">
                <div className={cn('flex items-center justify-between p-4 rounded-lg border', { 'bg-gray-800 border-gray-700': isDark, 'bg-gray-100 border-gray-200': !isDark })}>
                    <div>
                        <h4 className={cn('font-medium', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Premium Features</h4>
                        <p className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Enable advanced functionality</p>
                    </div>
                    <InputSwitch checked={premiumSwitch} onChange={(e) => setPremiumSwitch(e.value)} />
                </div>

                <div className={cn('flex items-center justify-between p-4 rounded-lg border', { 'bg-gray-800 border-gray-700': isDark, 'bg-gray-100 border-gray-200': !isDark })}>
                    <div>
                        <h4 className={cn('font-medium', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Notifications</h4>
                        <p className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Receive email updates</p>
                    </div>
                    <InputSwitch checked={notificationSwitch} onChange={(e) => setNotificationSwitch(e.value)} />
                </div>
            </div>
        </ComponentDemo>
    );
};

export default SettingsPanel;
