import React from 'react';
import { QRCode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<QRCode value="https://news.ycombinator.com" errorCorrection="L" />
<QRCode value="https://github.com/fluxo-ui" errorCorrection="M" />
<QRCode value="https://en.wikipedia.org/wiki/QR_code" errorCorrection="Q" />
<QRCode value="https://fluxo-ui.utilsware.com/?ref=docs" errorCorrection="H" />`;

const levels: { level: 'L' | 'M' | 'Q' | 'H'; recovery: number; value: string }[] = [
    { level: 'L', recovery: 7, value: 'https://news.ycombinator.com' },
    { level: 'M', recovery: 15, value: 'https://github.com/fluxo-ui' },
    { level: 'Q', recovery: 25, value: 'https://en.wikipedia.org/wiki/QR_code' },
    { level: 'H', recovery: 30, value: 'https://fluxo-ui.utilsware.com/?ref=docs' },
];

const valueLabelStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 11,
    color: 'var(--eui-text)',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 4,
    padding: '4px 8px',
    maxWidth: 180,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const ErrorCorrection: React.FC = () => (
    <>
        <ComponentDemo
            title="Error Correction Levels"
            description="Higher levels add redundancy so the code stays scannable when partially obscured. Each example encodes a different URL."
        >
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                {levels.map(({ level, recovery, value }) => (
                    <div key={level} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                        <QRCode value={value} size={160} errorCorrection={level} />
                        <span style={{ fontSize: 12, color: 'var(--eui-text-muted)', fontWeight: 600 }}>
                            Level {level} ({recovery}% recovery)
                        </span>
                        <div style={valueLabelStyle} title={value}>
                            {value}
                        </div>
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ErrorCorrection;
