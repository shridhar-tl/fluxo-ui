import cn from 'classnames';
import React from 'react';
import { SelectButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicOptions } from './select-button-story-data';

const code = `<SelectButton items={options} value={value} size="sm" />
<SelectButton items={options} value={value} size="md" />
<SelectButton items={options} value={value} size="lg" />`;

const SizeVariants: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo title="Different Sizes">
                <div className="space-y-4">
                    <div>
                        <div className={cn('text-sm mb-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Small</div>
                        <SelectButton items={basicOptions} value="option2" size="sm" />
                    </div>
                    <div>
                        <div className={cn('text-sm mb-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                            Medium (default)
                        </div>
                        <SelectButton items={basicOptions} value="option2" size="md" />
                    </div>
                    <div>
                        <div className={cn('text-sm mb-2', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Large</div>
                        <SelectButton items={basicOptions} value="option2" size="lg" />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default SizeVariants;
