import React from 'react';
import { SplitButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items = [
    { label: 'Option A', onClick: () => {} },
    { label: 'Option B', onClick: () => {} },
];

const code = `<SplitButton layout="default" label="Default" variant="primary" items={items} />
<SplitButton layout="outlined" label="Outlined" variant="primary" items={items} />
<SplitButton layout="rounded" label="Rounded" variant="primary" items={items} />
<SplitButton layout="sharp" label="Sharp" variant="primary" items={items} />
<SplitButton layout="plain" label="Plain" variant="primary" items={items} />`;

const Layouts: React.FC = () => (
    <>
        <ComponentDemo title="Layouts" description="Default, outlined, rounded, sharp, and plain shapes.">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <SplitButton layout="default" label="Default" variant="primary" items={items} />
                <SplitButton layout="outlined" label="Outlined" variant="primary" items={items} />
                <SplitButton layout="rounded" label="Rounded" variant="primary" items={items} />
                <SplitButton layout="sharp" label="Sharp" variant="primary" items={items} />
                <SplitButton layout="plain" label="Plain" variant="primary" items={items} />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Layouts;
