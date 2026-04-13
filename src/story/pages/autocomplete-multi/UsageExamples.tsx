import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicUsageCode, advancedUsageCode } from './autocomplete-multi-story-data';

const UsageExamples: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <div className="space-y-4">
                <h3 className={cn('text-lg font-medium', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Basic Usage</h3>
                <CodeBlock code={basicUsageCode} language="typescript" />
            </div>

            <div className="mt-6 space-y-4">
                <h3 className={cn('text-lg font-medium', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Advanced Usage</h3>
                <CodeBlock code={advancedUsageCode} language="typescript" />
            </div>
        </>
    );
};

export default UsageExamples;
