import React from 'react';
import { DiffViewer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleNew, sampleOld } from './diff-sample';

const code = `import { DiffViewer } from 'fluxo-ui';

<DiffViewer
    oldValue={oldText}
    newValue={newText}
    oldTitle="before.js"
    newTitle="after.js"
/>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Unified Diff" description="Classic git-style unified diff with word-level highlights on changed lines.">
            <div style={{ width: '100%' }}>
                <DiffViewer oldValue={sampleOld} newValue={sampleNew} oldTitle="before.js" newTitle="after.js" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
