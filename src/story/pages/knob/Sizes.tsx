import React from 'react';
import { Knob } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Knob value={64} size="xs" label="XS" />
<Knob value={64} size="sm" label="SM" />
<Knob value={64} size="md" label="MD" />
<Knob value={64} size="lg" label="LG" />
<Knob value={64} size="xl" label="XL" />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes" description="Five preset sizes from xs through xl.">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center' }}>
                <Knob value={64} size="xs" label="XS" />
                <Knob value={64} size="sm" label="SM" />
                <Knob value={64} size="md" label="MD" />
                <Knob value={64} size="lg" label="LG" />
                <Knob value={64} size="xl" label="XL" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
