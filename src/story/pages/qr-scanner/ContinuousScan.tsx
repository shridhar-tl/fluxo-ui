import React, { useState } from 'react';
import { QrScanner } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<QrScanner
  continuous
  onScan={(value) => setHistory((h) => [value, ...h])}
/>`;

const listStyle: React.CSSProperties = {
    padding: '12px 16px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    width: '100%',
    maxWidth: 520,
    color: 'var(--eui-text)',
    fontSize: 13,
    minHeight: 80,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
};

const ContinuousScan: React.FC = () => {
    const [history, setHistory] = useState<string[]>([]);

    return (
        <>
            <ComponentDemo
                title="Continuous Mode"
                description="With continuous=true, the scanner keeps reading after each successful detection — useful for batch entry. Duplicate codes are debounced for ~1.5 seconds."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 360 }}>
                        <QrScanner
                            continuous
                            onScan={(value) => setHistory((h) => [value, ...h].slice(0, 8))}
                        />
                    </div>
                    <div style={listStyle} aria-live="polite">
                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>
                            Scan history ({history.length})
                        </span>
                        {history.length === 0 ? (
                            <em style={{ color: 'var(--eui-text-muted)', fontSize: 12 }}>
                                No scans yet — start the scanner and aim at QR codes.
                            </em>
                        ) : (
                            history.map((value, index) => (
                                <code
                                    key={`${value}-${index}`}
                                    style={{
                                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                                        fontSize: 12,
                                        background: 'var(--eui-bg)',
                                        border: '1px solid var(--eui-border-subtle)',
                                        borderRadius: 4,
                                        padding: '4px 8px',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {value}
                                </code>
                            ))
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

export default ContinuousScan;
