import React, { useState } from 'react';
import { JsonEditor } from '../../../components';
import type { JsonValue } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { nestedObject } from './json-editor-story-data';

const code = `import { JsonEditor } from 'ether-ui';

const data = {
  user: {
    id: 1,
    profile: { firstName: 'Jane', lastName: 'Smith' },
    settings: { theme: 'dark', notifications: true },
  },
};

<JsonEditor value={data} onChange={setData} expandDepth={2} />`;

const NestedObjects: React.FC = () => {
    const [data, setData] = useState<JsonValue>(nestedObject);

    return (
        <>
            <ComponentDemo title="Nested Objects" description="Deep object hierarchies with collapsible tree view" centered={false}>
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

export default NestedObjects;
