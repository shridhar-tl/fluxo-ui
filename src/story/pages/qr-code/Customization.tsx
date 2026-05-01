import React, { useState } from 'react';
import { QRCode, QRCodeShape } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<QRCode
  value="https://fluxo-ui.utilsware.com/components/qr-code"
  size={220}
  foreground="#3b82f6"
  background="#ffffff"
  moduleShape="rounded"
  margin={4}
/>`;

const valueLabelStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 11,
    color: 'var(--eui-text)',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 4,
    padding: '4px 8px',
    maxWidth: 320,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const customizationValue = 'https://fluxo-ui.utilsware.com/components/qr-code';

const Customization: React.FC = () => {
    const [shape, setShape] = useState<QRCodeShape>('rounded');
    const [foreground, setForeground] = useState('#3b82f6');
    const [background, setBackground] = useState('#ffffff');
    const [size, setSize] = useState(220);
    const [margin, setMargin] = useState(4);

    return (
        <>
            <ComponentDemo
                title="Color & Size Controls"
                description="Tune foreground, background, module shape, size, and quiet zone margin."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <QRCode
                        value={customizationValue}
                        size={size}
                        foreground={foreground}
                        background={background}
                        moduleShape={shape}
                        margin={margin}
                    />
                    <div style={valueLabelStyle} title={customizationValue}>
                        Encodes: {customizationValue}
                    </div>
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
                        <label htmlFor="qr-shape">Shape</label>
                        <select
                            id="qr-shape"
                            value={shape}
                            onChange={(e) => setShape(e.target.value as QRCodeShape)}
                            style={{ gridColumn: '2 / span 2', padding: '4px 8px', borderRadius: 4 }}
                        >
                            <option value="square">square</option>
                            <option value="rounded">rounded</option>
                            <option value="dots">dots</option>
                        </select>

                        <label htmlFor="qr-fg">Foreground</label>
                        <input id="qr-fg" type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} />
                        <span>{foreground}</span>

                        <label htmlFor="qr-bg">Background</label>
                        <input id="qr-bg" type="color" value={background} onChange={(e) => setBackground(e.target.value)} />
                        <span>{background}</span>

                        <label htmlFor="qr-size">Size</label>
                        <input
                            id="qr-size"
                            type="range"
                            min={120}
                            max={360}
                            step={4}
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                        />
                        <span>{size}px</span>

                        <label htmlFor="qr-margin">Margin</label>
                        <input
                            id="qr-margin"
                            type="range"
                            min={0}
                            max={10}
                            step={1}
                            value={margin}
                            onChange={(e) => setMargin(Number(e.target.value))}
                        />
                        <span>{margin}</span>
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
