import React, { useState } from 'react';
import { JsonEditor } from '../../../components';
import type { JsonValue } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicObject } from './json-editor-story-data';

const code = `import { JsonEditor } from 'ether-ui';

const [data, setData] = useState({
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  active: true,
  role: null,
});

<JsonEditor value={data} onChange={setData} />`;

const BasicUsage: React.FC = () => {
    const [data, setData] = useState<JsonValue>(basicObject);

    return (
        <>
            <ComponentDemo title="Basic JSON Editor" description="Edit simple key-value pairs with automatic type detection" centered={false}>
                <div className="w-full p-4">
                    <JsonEditor value={data} onChange={setData} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
