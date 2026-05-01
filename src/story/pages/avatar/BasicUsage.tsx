import React from 'react';
import { Avatar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Avatar } from 'fluxo-ui';

<Avatar src="https://i.pravatar.cc/120?u=jane" alt="Jane Doe" />
<Avatar name="Jane Doe" />
<Avatar name="Marcus" status="online" />
<Avatar name="Anna" status="busy" shape="rounded" />`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Default Avatar" description="Image, initials, and icon fallbacks with optional status dot.">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar src="https://i.pravatar.cc/120?u=jane" alt="Jane Doe" />
                <Avatar name="Jane Doe" />
                <Avatar name="Marcus Lopez" status="online" />
                <Avatar name="Anna Kim" status="busy" shape="rounded" />
                <Avatar name="Olivia Park" status="away" shape="square" />
                <Avatar />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
