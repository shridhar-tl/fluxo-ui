import React from 'react';
import { SplitButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items = [
    { label: 'Option A', onClick: () => {} },
    { label: 'Option B', onClick: () => {} },
];

const code = `<SplitButton size="xs" label="XS" items={items} />
<SplitButton size="sm" label="SM" items={items} />
<SplitButton size="md" label="MD" items={items} />
<SplitButton size="lg" label="LG" items={items} />
<SplitButton size="xl" label="XL" items={items} />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes" description="Five preset sizes from xs through xl.">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <SplitButton size="xs" variant="primary" label="XS" items={items} />
                <SplitButton size="sm" variant="primary" label="SM" items={items} />
                <SplitButton size="md" variant="primary" label="MD" items={items} />
                <SplitButton size="lg" variant="primary" label="LG" items={items} />
                <SplitButton size="xl" variant="primary" label="XL" items={items} />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
