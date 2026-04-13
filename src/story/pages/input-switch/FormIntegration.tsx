import cn from 'classnames';
import React from 'react';
import { InputSwitch } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const FormIntegration: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Form Integration" description="Switch integrated with form labels">
            <div className="space-y-6 max-w-md">
                <div className="flex items-center space-x-3">
                    <InputSwitch checked={false} onChange={(e) => console.log('Email notifications:', e.value)} />
                    <label className={cn('cursor-pointer', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Send me email notifications</label>
                </div>

                <div className="flex items-center space-x-3">
                    <InputSwitch checked={true} onChange={(e) => console.log('Marketing emails:', e.value)} />
                    <label className={cn('cursor-pointer', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>I agree to receive marketing emails</label>
                </div>

                <div className="flex items-center space-x-3">
                    <InputSwitch checked={false} onChange={(e) => console.log('Terms accepted:', e.value)} />
                    <label className={cn('cursor-pointer', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>I accept the terms and conditions</label>
                </div>
            </div>
        </ComponentDemo>
    );
};

export default FormIntegration;
