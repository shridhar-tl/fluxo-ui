import React, { useState } from 'react';
import { NumericInput as NumericInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const NumericInput = withFieldLabel(NumericInputRaw);

const code = `<NumericInput
  label="Volume"
  value={value}
  onChange={(e) => setValue(e.value ?? 0)}
  step={1}
  largeStep={10}
  min={0}
  max={100}
/>`;

const KeyboardStepping: React.FC = () => {
    const [volume, setVolume] = useState(20);

    return (
        <>
            <ComponentDemo
                title="Keyboard Stepping (ArrowUp / ArrowDown)"
                description="Focus the input then press ArrowUp / ArrowDown to step by 1. Hold Shift for the larger step (10)."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
                    <NumericInput
                        label="Volume (0–100)"
                        value={volume}
                        onChange={(e) => setVolume(e.value ?? 0)}
                        step={1}
                        largeStep={10}
                        min={0}
                        max={100}
                    />
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                            color: 'var(--eui-text)',
                        }}
                    >
                        Current value: <strong>{volume}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default KeyboardStepping;
