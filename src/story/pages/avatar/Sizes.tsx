import React from 'react';
import { Avatar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Avatar name="A" size="xs" />
<Avatar name="A" size="sm" />
<Avatar name="A" size="md" />
<Avatar name="A" size="lg" />
<Avatar name="A" size="xl" />
<Avatar name="A" size={120} />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes" description="Five preset sizes plus arbitrary pixel values.">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
                    <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                        <Avatar name="Jane Doe" size={s} status="online" />
                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>{s}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                    <Avatar name="Jane Doe" size={120} status="online" />
                    <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>120px</span>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
