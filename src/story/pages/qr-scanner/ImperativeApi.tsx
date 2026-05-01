import React, { useRef, useState } from 'react';
import { QrScanner } from '../../../components';
import type { QrScannerHandle } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { scanQrCodeOnce } from 'fluxo-ui/utils';

// Lower-level utility — bring your own video element
const value = await scanQrCodeOnce({ video: videoRef.current });

// Or drive the component imperatively
const ref = useRef<QrScannerHandle>(null);
ref.current?.start();
ref.current?.stop();`;

const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    padding: '12px 16px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    width: '100%',
    maxWidth: 520,
};

const buttonStyle: React.CSSProperties = {
    padding: '8px 14px',
    border: '1px solid var(--eui-border)',
    borderRadius: 4,
    background: 'var(--eui-bg)',
    color: 'var(--eui-text)',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
    minHeight: 36,
};

const ImperativeApi: React.FC = () => {
    const ref = useRef<QrScannerHandle>(null);
    const [lastValue, setLastValue] = useState<string | null>(null);

    return (
        <>
            <ComponentDemo
                title="Imperative Control"
                description="Use the ref handle to start/stop the scanner from outside the component, or call the lower-level scanQrCodeOnce utility directly with your own video element."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 360 }}>
                        <QrScanner ref={ref} onScan={(value) => setLastValue(value)} />
                    </div>
                    <div style={buttonRowStyle}>
                        <button type="button" style={buttonStyle} onClick={() => ref.current?.start()}>
                            ref.start()
                        </button>
                        <button type="button" style={buttonStyle} onClick={() => ref.current?.stop()}>
                            ref.stop()
                        </button>
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--eui-text-muted)', alignSelf: 'center' }}>
                            Last: {lastValue ?? '—'}
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

export default ImperativeApi;
