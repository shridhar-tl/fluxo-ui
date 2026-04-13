import cn from 'classnames';
import React, { useState } from 'react';
import { JsonEditor } from '../../../components';
import type { JsonEditorSize, JsonValue } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const sampleData: JsonValue = {
    name: 'Example',
    count: 42,
    active: true,
    tags: ['react', 'typescript'],
};

const sizes: { key: JsonEditorSize; label: string }[] = [
    { key: 'sm', label: 'Small' },
    { key: 'md', label: 'Medium (Default)' },
    { key: 'lg', label: 'Large' },
];

const SizeVariants: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [data, setData] = useState<Record<string, JsonValue>>({
        sm: { ...sampleData as Record<string, JsonValue> },
        md: { ...sampleData as Record<string, JsonValue> },
        lg: { ...sampleData as Record<string, JsonValue> },
    });

    return (
        <ComponentDemo title="Size Variants" description="Three size options for different use cases" centered={false}>
            <div className="w-full space-y-6 p-4">
                {sizes.map(({ key, label }) => (
                    <div key={key}>
                        <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>{label}</p>
                        <JsonEditor
                            value={data[key]}
                            onChange={val => setData(prev => ({ ...prev, [key]: val }))}
                            size={key}
                            expandDepth={1}
                        />
                    </div>
                ))}
            </div>
        </ComponentDemo>
    );
};

export default SizeVariants;
