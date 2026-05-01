import React, { useState } from 'react';
import { Knob } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const [volume, setVolume] = useState(60);
<Knob
  value={volume}
  interactive
  step={5}
  onChange={setVolume}
  label="Volume"
  unit="%"
  color="primary"
/>`;

const Interactive: React.FC = () => {
    const [volume, setVolume] = useState(60);
    const [bass, setBass] = useState(45);
    const [treble, setTreble] = useState(72);
    return (
        <>
            <ComponentDemo
                title="Interactive Editing"
                description="Drag the knob, use arrow keys, PageUp/PageDown for ×10 steps, or Home/End for min/max."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Knob value={volume} interactive step={5} onChange={setVolume} label="Volume" unit="%" />
                        <Knob value={bass} interactive step={1} onChange={setBass} label="Bass" color="success" />
                        <Knob value={treble} interactive step={1} onChange={setTreble} label="Treble" color="warning" />
                    </div>
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                        }}
                    >
                        Volume: <strong>{volume}</strong> · Bass: <strong>{bass}</strong> · Treble: <strong>{treble}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Interactive;
