import cn from 'classnames';
import React, { useState } from 'react';
import { ToggleButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `const [settings, setSettings] = useState({
  darkMode: false,
  notifications: true,
  autoSave: false,
});

const handleToggle = (key) => (e) => {
  setSettings(prev => ({ ...prev, [key]: e.value }));
};

<div className="space-y-4">
  <div className="flex items-center justify-between">
    <span>Dark Mode</span>
    <ToggleButton
      checked={settings.darkMode}
      onChange={handleToggle('darkMode')}
    />
  </div>
  <div className="flex items-center justify-between">
    <span>Notifications</span>
    <ToggleButton
      checked={settings.notifications}
      onChange={handleToggle('notifications')}
    />
  </div>
  <div className="flex items-center justify-between">
    <span>Auto-Save</span>
    <ToggleButton
      checked={settings.autoSave}
      onChange={handleToggle('autoSave')}
    />
  </div>
</div>`;

const MultipleToggles: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [multipleToggles, setMultipleToggles] = useState({
        feature1: false,
        feature2: true,
        feature3: false,
    });

    const handleMultipleToggle = (key: string) => (e: { value: boolean }) => {
        setMultipleToggles((prev) => ({ ...prev, [key]: e.value }));
    };

    return (
        <>
            <ComponentDemo title="Managing Multiple Toggles">
                <div className="space-y-4 w-full max-w-md">
                    <div className={cn('flex items-center justify-between p-4 rounded-lg', { 'bg-gray-800': isDark, 'bg-gray-100': !isDark })}>
                        <div>
                            <h4 className={cn('font-medium', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Dark Mode</h4>
                            <p className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Enable dark theme</p>
                        </div>
                        <ToggleButton
                            checked={multipleToggles.feature1}
                            onChange={handleMultipleToggle('feature1')}
                            onLabel="On"
                            offLabel="Off"
                        />
                    </div>
                    <div className={cn('flex items-center justify-between p-4 rounded-lg', { 'bg-gray-800': isDark, 'bg-gray-100': !isDark })}>
                        <div>
                            <h4 className={cn('font-medium', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Notifications</h4>
                            <p className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Receive email notifications</p>
                        </div>
                        <ToggleButton
                            checked={multipleToggles.feature2}
                            onChange={handleMultipleToggle('feature2')}
                            onLabel="On"
                            offLabel="Off"
                        />
                    </div>
                    <div className={cn('flex items-center justify-between p-4 rounded-lg', { 'bg-gray-800': isDark, 'bg-gray-100': !isDark })}>
                        <div>
                            <h4 className={cn('font-medium', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Auto-Save</h4>
                            <p className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Automatically save changes</p>
                        </div>
                        <ToggleButton
                            checked={multipleToggles.feature3}
                            onChange={handleMultipleToggle('feature3')}
                            onLabel="On"
                            offLabel="Off"
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default MultipleToggles;
