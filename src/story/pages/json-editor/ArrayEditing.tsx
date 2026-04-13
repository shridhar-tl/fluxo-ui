import React, { useState } from 'react';
import { JsonEditor } from '../../../components';
import type { JsonValue } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { arrayData } from './json-editor-story-data';

const code = `import { JsonEditor } from 'ether-ui';

const data = {
  fruits: ['Apple', 'Banana', 'Cherry'],
  users: [
    { name: 'Alice', role: 'admin' },
    { name: 'Bob', role: 'user' },
  ],
};

<JsonEditor value={data} onChange={setData} expandDepth={2} />`;

const ArrayEditing: React.FC = () => {
    const [data, setData] = useState<JsonValue>(arrayData);

    return (
        <>
            <ComponentDemo title="Arrays & Nested Arrays" description="Full array editing with add, remove, and insert operations" centered={false}>
                <div className="w-full p-4">
                    <JsonEditor value={data} onChange={setData} expandDepth={2} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ArrayEditing;
