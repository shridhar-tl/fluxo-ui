import React, { useState } from 'react';
import { Barcode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Barcode
  value="HELLO"
  format="CODE39"
  width={3}
  height={100}
  foreground="#3b82f6"
  background="var(--eui-bg)"
  fontSize={16}
  displayValue
/>`;

const Customization: React.FC = () => {
    const [width, setWidth] = useState(2);
    const [height, setHeight] = useState(80);
    const [foreground, setForeground] = useState('#1f2937');
    const [displayValue, setDisplayValue] = useState(true);
    const [margin, setMargin] = useState(10);

    return (
        <>
            <ComponentDemo
                title="Visual Customization"
                description="Tune bar width, height, color, margin, and the human-readable text below."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <Barcode
                        value="HELLO"
                        format="CODE39"
                        width={width}
                        height={height}
                        foreground={foreground}
                        margin={margin}
                        displayValue={displayValue}
                    />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto',
                            gap: 12,
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            width: '100%',
                            maxWidth: 520,
                            fontSize: 13,
                        }}
                    >
                        <label htmlFor="bc-width">Bar width</label>
                        <input id="bc-width" type="range" min={1} max={6} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
                        <span>{width}px</span>

                        <label htmlFor="bc-height">Height</label>
                        <input
                            id="bc-height"
                            type="range"
                            min={40}
                            max={200}
                            step={4}
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                        />
                        <span>{height}px</span>

                        <label htmlFor="bc-margin">Margin</label>
                        <input
                            id="bc-margin"
                            type="range"
                            min={0}
                            max={30}
                            step={1}
                            value={margin}
                            onChange={(e) => setMargin(Number(e.target.value))}
                        />
                        <span>{margin}px</span>

                        <label htmlFor="bc-fg">Foreground</label>
                        <input id="bc-fg" type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} />
                        <span>{foreground}</span>

                        <label htmlFor="bc-display">Show text</label>
                        <input
                            id="bc-display"
                            type="checkbox"
                            checked={displayValue}
                            onChange={(e) => setDisplayValue(e.target.checked)}
                        />
                        <span>{displayValue ? 'on' : 'off'}</span>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Customization;
