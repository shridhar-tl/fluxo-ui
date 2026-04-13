import React from 'react';
import { JsonEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readOnlyData } from './json-editor-story-data';

const code = `import { JsonEditor } from 'fluxo-ui';

<JsonEditor value={data} readOnly />`;

const ReadOnlyMode: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Read-Only Viewer" description="Display JSON data without edit capabilities" centered={false}>
                <div className="w-full p-4">
                    <JsonEditor value={readOnlyData} readOnly expandDepth={2} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ReadOnlyMode;
