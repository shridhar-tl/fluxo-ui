import React, { useState } from 'react';
import { QRCode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { QRCode } from 'fluxo-ui';

<QRCode value="https://fluxo-ui.utilsware.com/" size={200} />`;

const valueLabelStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 11,
    color: 'var(--eui-text)',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 4,
    padding: '4px 8px',
    maxWidth: 220,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const BasicUsage: React.FC = () => {
    const [value, setValue] = useState('https://fluxo-ui.utilsware.com/');
    return (
        <>
            <ComponentDemo
                title="Default QR Code"
                description="Type any URL or text — the QR updates live so you can scan it from your phone camera."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <QRCode value={value || ' '} size={240} />
                    <div style={valueLabelStyle} title={value}>
                        Encodes: {value || '(empty)'}
                    </div>
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            width: '100%',
                            maxWidth: 520,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        <label htmlFor="qr-input" style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>
                            Encoded value · scan with your phone to verify
                        </label>
                        <input
                            id="qr-input"
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="https://example.com or any text"
                            style={{
                                padding: '6px 10px',
                                border: '1px solid var(--eui-border)',
                                borderRadius: 4,
                                background: 'var(--eui-bg)',
                                color: 'var(--eui-text)',
                                fontSize: 14,
                                fontFamily: 'inherit',
                            }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>
                            {value.length} characters · the QR re-encodes live
                        </span>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
