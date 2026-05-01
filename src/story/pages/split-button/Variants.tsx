import React from 'react';
import { SplitButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items = [
    { label: 'Option A', onClick: () => {} },
    { label: 'Option B', onClick: () => {} },
    { label: 'Option C', onClick: () => {} },
];

const code = `<SplitButton variant="default" label="Default" items={items} />
<SplitButton variant="primary" label="Primary" items={items} />
<SplitButton variant="success" label="Success" items={items} />
<SplitButton variant="warning" label="Warning" items={items} />
<SplitButton variant="danger" label="Danger" items={items} />
<SplitButton variant="info" label="Info" items={items} />
<SplitButton variant="secondary" label="Secondary" items={items} />`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Variants" description="All seven Button variants flow through both halves.">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <SplitButton variant="default" label="Default" items={items} />
                <SplitButton variant="primary" label="Primary" items={items} />
                <SplitButton variant="success" label="Success" items={items} />
                <SplitButton variant="warning" label="Warning" items={items} />
                <SplitButton variant="danger" label="Danger" items={items} />
                <SplitButton variant="info" label="Info" items={items} />
                <SplitButton variant="secondary" label="Secondary" items={items} />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
