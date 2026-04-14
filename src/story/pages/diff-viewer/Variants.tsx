import React from 'react';
import { DiffViewer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleNew, sampleOld } from './diff-sample';

const code = `<DiffViewer variant="split" oldValue={...} newValue={...} />
<DiffViewer variant="inline" oldValue={...} newValue={...} />
<DiffViewer variant="minimal" collapseUnchanged oldValue={...} newValue={...} />`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Split View" description="Side-by-side two-column layout.">
            <div style={{ width: '100%' }}>
                <DiffViewer variant="split" oldValue={sampleOld} newValue={sampleNew} oldTitle="before.js" newTitle="after.js" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>

        <div className="mt-6">
            <ComponentDemo title="Inline Diff" description="Compact inline word-level diff for small snippets.">
                <div style={{ width: '100%' }}>
                    <DiffViewer variant="inline" oldValue={sampleOld} newValue={sampleNew} />
                </div>
            </ComponentDemo>
        </div>

        <div className="mt-6">
            <ComponentDemo title="Collapse Unchanged" description="Runs of unchanged lines are folded into context hunks.">
                <div style={{ width: '100%' }}>
                    <DiffViewer oldValue={sampleOld} newValue={sampleNew} collapseUnchanged={2} />
                </div>
            </ComponentDemo>
        </div>
    </>
);

export default Variants;
