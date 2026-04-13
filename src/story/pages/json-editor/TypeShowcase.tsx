import React, { useState } from 'react';
import type { JsonValue } from '../../../components';
import { JsonEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { typeShowcaseData } from './json-editor-story-data';

const code = `import { JsonEditor } from 'fluxo-ui';

<JsonEditor
  value={data}
  onChange={setData}
  showDataTypes
  allowTypeChange
/>`;

const TypeShowcase: React.FC = () => {
    const [data, setData] = useState<JsonValue>(typeShowcaseData);

    return (
        <>
            <ComponentDemo
                title="Data Types & Type Badges"
                description="All supported data types with type badges and type changing"
                centered={false}
            >
                <div className="w-full p-4">
                    <JsonEditor value={data} onChange={setData} showDataTypes allowTypeChange expandDepth={1} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default TypeShowcase;
