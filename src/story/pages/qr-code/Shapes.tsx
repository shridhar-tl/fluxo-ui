import React from 'react';
import { QRCode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<QRCode value="https://example.com" moduleShape="square" />
<QRCode value="mailto:hello@fluxo-ui.dev" moduleShape="rounded" />
<QRCode value="tel:+1-555-867-5309" moduleShape="dots" />`;

const shapes: { shape: 'square' | 'rounded' | 'dots'; value: string }[] = [
    { shape: 'square', value: 'https://example.com' },
    { shape: 'rounded', value: 'mailto:hello@fluxo-ui.dev' },
    { shape: 'dots', value: 'tel:+1-555-867-5309' },
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

const Shapes: React.FC = () => (
    <>
        <ComponentDemo title="Module Shapes" description="Square (default), rounded, or dotted modules. Each example encodes a different value.">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                {shapes.map(({ shape, value }) => (
                    <div key={shape} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                        <QRCode value={value} size={160} moduleShape={shape} />
                        <span style={{ fontSize: 12, color: 'var(--eui-text-muted)', fontWeight: 600 }}>{shape}</span>
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

export default Shapes;
