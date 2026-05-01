import React, { useState } from 'react';
import { QrScanner } from '../../../components';
import type { QrScannerProps } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<QrScanner
  overlay="frame"
  aspectRatio={1.333}
  facingMode="environment"
  showTorchToggle
  showCameraSwitch
  onScan={handleScan}
/>`;

const controlsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: 10,
    alignItems: 'center',
    padding: '12px 16px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    width: '100%',
    maxWidth: 520,
    fontSize: 13,
};

const readoutStyle: React.CSSProperties = {
    padding: '12px 16px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    width: '100%',
    maxWidth: 520,
    color: 'var(--eui-text)',
    fontSize: 13,
};

const Customization: React.FC = () => {
    const [overlay, setOverlay] = useState<NonNullable<QrScannerProps['overlay']>>('mask');
    const [aspectRatio, setAspectRatio] = useState(1);
    const [facingMode, setFacingMode] = useState<NonNullable<QrScannerProps['facingMode']>>('environment');
    const [lastValue, setLastValue] = useState<string | null>(null);

    return (
        <>
            <ComponentDemo
                title="Overlay & Aspect Ratio"
                description="Switch between the dimmed mask and bracket-only frame overlays, change aspect ratio, and pick the front or rear camera."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 420 }}>
                        <QrScanner
                            overlay={overlay}
                            aspectRatio={aspectRatio}
                            facingMode={facingMode}
                            onScan={(value) => setLastValue(value)}
                        />
                    </div>
                    <div style={controlsStyle}>
                        <label htmlFor="qr-overlay">Overlay</label>
                        <select
                            id="qr-overlay"
                            value={overlay}
                            onChange={(e) => setOverlay(e.target.value as NonNullable<QrScannerProps['overlay']>)}
                            style={{ padding: '4px 8px', borderRadius: 4 }}
                        >
                            <option value="mask">mask</option>
                            <option value="frame">frame</option>
                            <option value="none">none</option>
                        </select>

                        <label htmlFor="qr-ratio">Aspect ratio</label>
                        <select
                            id="qr-ratio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(Number(e.target.value))}
                            style={{ padding: '4px 8px', borderRadius: 4 }}
                        >
                            <option value={1}>1 : 1</option>
                            <option value={1.333}>4 : 3</option>
                            <option value={1.777}>16 : 9</option>
                            <option value={0.75}>3 : 4 (portrait)</option>
                        </select>

                        <label htmlFor="qr-facing">Camera</label>
                        <select
                            id="qr-facing"
                            value={facingMode}
                            onChange={(e) => setFacingMode(e.target.value as NonNullable<QrScannerProps['facingMode']>)}
                            style={{ padding: '4px 8px', borderRadius: 4 }}
                        >
                            <option value="environment">Rear (environment)</option>
                            <option value="user">Front (user)</option>
                        </select>
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>Last decoded value</span>
                        <div
                            style={{
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                                fontSize: 13,
                                wordBreak: 'break-all',
                                marginTop: 4,
                            }}
                        >
                            {lastValue ?? '—'}
                        </div>
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
