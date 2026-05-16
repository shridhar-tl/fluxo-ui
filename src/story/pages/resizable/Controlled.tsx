import React, { useState } from 'react';
import { Resizable } from '../../../components/resizable';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const [size, setSize] = useState({ width: 320, height: 200 });

<Resizable
  width={size.width}
  height={size.height}
  onSizeChange={setSize}
  minWidth={120}
  minHeight={80}
>
  ...
</Resizable>
<input type="range" min={120} max={500} value={size.width}
  onChange={(e) => setSize(s => ({ ...s, width: +e.target.value }))} />`;

const Controlled: React.FC = () => {
    const [size, setSize] = useState({ width: 320, height: 200 });

    return (
        <ComponentDemo
            title="Controlled Mode"
            description="Provide width and height props (and listen to onSizeChange) for two-way binding with external controls."
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                    <Resizable
                        width={size.width}
                        height={size.height}
                        minWidth={120}
                        minHeight={80}
                        maxWidth={520}
                        maxHeight={400}
                        onSizeChange={setSize}
                        ariaLabel="Controlled card"
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'var(--eui-bg-subtle)',
                                border: '1px solid var(--eui-border)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--eui-text)',
                                fontSize: 13,
                            }}
                        >
                            Drive me from the sliders below
                        </div>
                    </Resizable>
                </div>
                <div
                    style={{
                        padding: 14,
                        background: 'var(--eui-bg-subtle)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}
                >
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--eui-text)' }}>
                        <span style={{ width: 60 }}>Width</span>
                        <input
                            type="range"
                            min={120}
                            max={520}
                            value={size.width}
                            onChange={(e) => setSize((s) => ({ ...s, width: +e.target.value }))}
                            style={{ flex: 1 }}
                            aria-label="Width"
                        />
                        <span style={{ width: 60, textAlign: 'right' }}>{Math.round(size.width)} px</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--eui-text)' }}>
                        <span style={{ width: 60 }}>Height</span>
                        <input
                            type="range"
                            min={80}
                            max={400}
                            value={size.height}
                            onChange={(e) => setSize((s) => ({ ...s, height: +e.target.value }))}
                            style={{ flex: 1 }}
                            aria-label="Height"
                        />
                        <span style={{ width: 60, textAlign: 'right' }}>{Math.round(size.height)} px</span>
                    </label>
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default Controlled;
