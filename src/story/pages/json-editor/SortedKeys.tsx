import cn from 'classnames';
import React, { useState } from 'react';
import { JsonEditor } from '../../../components';
import type { JsonValue } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const unsortedData: JsonValue = {
    zebra: 'last animal',
    apple: 'first fruit',
    mango: 'tropical fruit',
    banana: 'yellow fruit',
    config: {
        zIndex: 100,
        animation: true,
        border: '1px solid',
    },
};

const code = `<JsonEditor value={data} onChange={setData} sortKeys />`;

const SortedKeys: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [data1, setData1] = useState<JsonValue>({ ...unsortedData as Record<string, JsonValue> });
    const [data2, setData2] = useState<JsonValue>({ ...unsortedData as Record<string, JsonValue> });

    return (
        <>
            <ComponentDemo title="Sorted Keys" description="Automatically sort object keys alphabetically" centered={false}>
                <div className="w-full space-y-6 p-4">
                    <div>
                        <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Default (insertion order)</p>
                        <JsonEditor value={data1} onChange={setData1} expandDepth={2} />
                    </div>
                    <div>
                        <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Sorted keys</p>
                        <JsonEditor value={data2} onChange={setData2} sortKeys expandDepth={2} />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default SortedKeys;
