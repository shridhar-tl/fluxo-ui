import React, { useState } from 'react';
import { QrScanner } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { QrScanner } from 'fluxo-ui';

<QrScanner
  onScan={(value) => console.log('Decoded:', value)}
  onError={(err) => console.error(err)}
/>`;

const readoutStyle: React.CSSProperties = {
    padding: '12px 16px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    width: '100%',
    maxWidth: 520,
    color: 'var(--eui-text)',
    fontSize: 13,
    wordBreak: 'break-all',
    minHeight: 56,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
};

const BasicUsage: React.FC = () => {
    const [lastValue, setLastValue] = useState<string | null>(null);
    const [errorText, setErrorText] = useState<string | null>(null);

    return (
        <>
            <ComponentDemo
                title="Default Scanner"
                description="Click Start scanning, point your camera at any QR code, and the decoded value appears below. Uses the native BarcodeDetector API — no third-party dependency."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 360 }}>
                        <QrScanner
                            onScan={(value) => {
                                setLastValue(value);
                                setErrorText(null);
                            }}
                            onError={(err) => setErrorText(err.message)}
                        />
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>
                            Last decoded value
                        </span>
                        <strong style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13 }}>
                            {lastValue ?? '— nothing scanned yet —'}
                        </strong>
                        {errorText && (
                            <small style={{ color: '#ef4444' }}>Error: {errorText}</small>
                        )}
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
