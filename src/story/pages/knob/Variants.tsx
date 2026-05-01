import React from 'react';
import { Knob } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Knob value={72} variant="solid" label="Solid" />
<Knob value={72} variant="gradient" gradient={{ from: '#3b82f6', to: '#a855f7' }} label="Gradient" />
<Knob value={72} variant="striped" label="Striped" color="success" />
<Knob value={72} variant="dashed" label="Dashed" color="warning" />
<Knob value={72} variant="pie" label="Pie" color="danger" />`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Variants" description="Solid, gradient, striped, dashed, and pie variants.">
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Knob value={72} variant="solid" label="Solid" />
                <Knob
                    value={72}
                    variant="gradient"
                    gradient={{ from: '#3b82f6', to: '#a855f7' }}
                    label="Gradient"
                />
                <Knob value={72} variant="striped" label="Striped" color="success" />
                <Knob value={72} variant="dashed" label="Dashed" color="warning" />
                <Knob value={72} variant="pie" label="Pie" color="danger" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
