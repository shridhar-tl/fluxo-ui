import cn from 'classnames';
import React from 'react';
import { SelectButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicOptions } from './select-button-story-data';

const code = `<SelectButton items={options} value={value} theme="primary" />
<SelectButton items={options} value={value} theme="success" />
<SelectButton items={options} value={value} theme="secondary" />`;

const ThemeVariants: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo title="Different Themes">
                <div className="space-y-4">
                    <div>
                        <div className={cn('text-sm mb-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Primary</div>
                        <SelectButton items={basicOptions} value="option2" theme="primary" />
                    </div>
                    <div>
                        <div className={cn('text-sm mb-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Success</div>
                        <SelectButton items={basicOptions} value="option2" theme="success" />
                    </div>
                    <div>
                        <div className={cn('text-sm mb-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Secondary</div>
                        <SelectButton items={basicOptions} value="option2" theme="secondary" />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ThemeVariants;
