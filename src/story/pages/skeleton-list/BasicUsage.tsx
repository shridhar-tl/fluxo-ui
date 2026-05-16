import React from 'react';
import { SkeletonList } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { SkeletonList } from 'fluxo-ui';

<SkeletonList rows={6} variant="avatar-two-line" />`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Default avatar-two-line placeholder" description="A typical mobile list row placeholder — avatar + title + subtitle + trailing meta.">
            <div style={{ width: '100%', maxWidth: 480, border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden', background: 'var(--eui-bg)' }}>
                <SkeletonList rows={6} />
            </div>
        </ComponentDemo>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default BasicUsage;
