import React from 'react';
import { Knob } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Knob value={72} arcStart={135} arcEnd={405} label="Speed" unit="km/h" color="primary" />
<Knob value={32} arcStart={180} arcEnd={360} label="Battery" unit="%" color="success" />`;

const Gauge: React.FC = () => (
    <>
        <ComponentDemo title="Partial Arcs" description="Use arcStart and arcEnd to render gauges or half-circles.">
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Knob value={72} arcStart={135} arcEnd={405} label="Speed" unit="km/h" color="primary" size="lg" />
                <Knob value={32} arcStart={180} arcEnd={360} label="Battery" unit="%" color="success" size="lg" />
                <Knob value={88} arcStart={90} arcEnd={450} label="Storage" unit="%" color="info" size="lg" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Gauge;
