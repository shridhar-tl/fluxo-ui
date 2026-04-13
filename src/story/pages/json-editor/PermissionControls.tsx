import cn from 'classnames';
import React, { useState } from 'react';
import { JsonEditor } from '../../../components';
import type { JsonValue } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const sampleData: JsonValue = {
    project: 'EtherUI',
    version: '1.0.0',
    settings: {
        debug: false,
        maxRetries: 3,
    },
    tags: ['react', 'typescript'],
};

const code = `<JsonEditor
  value={data}
  onChange={setData}
  allowEditKey={false}
  allowRemove={false}
  allowInsert={false}
/>`;

const PermissionControls: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [data1, setData1] = useState<JsonValue>({ ...sampleData as Record<string, JsonValue> });
    const [data2, setData2] = useState<JsonValue>({ ...sampleData as Record<string, JsonValue> });
    const [data3, setData3] = useState<JsonValue>({ ...sampleData as Record<string, JsonValue> });

    return (
        <>
            <ComponentDemo title="Permission Controls" description="Fine-grained control over edit, add, and remove operations" centered={false}>
                <div className="w-full space-y-6 p-4">
                    <div>
                        <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Values only (no key editing, no add/remove)</p>
                        <JsonEditor
                            value={data1}
                            onChange={setData1}
                            allowEditKey={false}
                            allowRemove={false}
                            allowInsert={false}
                            expandDepth={2}
                        />
                    </div>
                    <div>
                        <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>No delete allowed</p>
                        <JsonEditor
                            value={data2}
                            onChange={setData2}
                            allowRemove={false}
                            expandDepth={2}
                        />
                    </div>
                    <div>
                        <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>No add allowed</p>
                        <JsonEditor
                            value={data3}
                            onChange={setData3}
                            allowInsert={false}
                            expandDepth={2}
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default PermissionControls;
