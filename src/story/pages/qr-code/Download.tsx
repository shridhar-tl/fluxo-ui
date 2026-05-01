import React, { useRef } from 'react';
import { Button, QRCode } from '../../../components';
import type { QRCodeHandle } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const downloadValue = 'BEGIN:VCARD\nVERSION:3.0\nFN:Fluxo UI\nURL:https://fluxo-ui.utilsware.com\nEMAIL:hello@fluxo-ui.dev\nEND:VCARD';

const code = `import { useRef } from 'react';
import { Button, QRCode } from 'fluxo-ui';
import type { QRCodeHandle } from 'fluxo-ui';

function Example() {
    const qrRef = useRef<QRCodeHandle>(null);
    const value = \`${downloadValue}\`;

    return (
        <>
            <QRCode ref={qrRef} value={value} size={240} />
            <Button onClick={() => qrRef.current?.download({ format: 'png', fileName: 'fluxo-vcard', scale: 4 })}>
                Download PNG
            </Button>
            <Button onClick={() => qrRef.current?.download({ format: 'svg', fileName: 'fluxo-vcard' })}>
                Download SVG
            </Button>
        </>
    );
}`;

const valueLabelStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 11,
    color: 'var(--eui-text)',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 4,
    padding: '8px 10px',
    maxWidth: 360,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
};

const Download: React.FC = () => {
    const qrRef = useRef<QRCodeHandle>(null);

    const handleDownload = (format: 'png' | 'svg' | 'jpeg') => {
        qrRef.current?.download({ format, fileName: 'fluxo-vcard', scale: 4 }).catch(() => {});
    };

    return (
        <>
            <ComponentDemo
                title="Download as image"
                description="Use a ref to call download() — supports PNG, JPEG, and SVG. PNG/JPEG accept a scale factor for high-DPI exports. This example encodes a vCard so scanning adds the contact straight to your phone."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <QRCode ref={qrRef} value={downloadValue} size={240} />
                    <div style={valueLabelStyle}>
                        Encodes vCard:
                        {'\n'}
                        {downloadValue}
                    </div>
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            justifyContent: 'center',
                        }}
                    >
                        <Button variant="primary" onClick={() => handleDownload('png')}>Download PNG</Button>
                        <Button variant="secondary" onClick={() => handleDownload('svg')}>Download SVG</Button>
                        <Button variant="secondary" onClick={() => handleDownload('jpeg')}>Download JPEG</Button>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Download;
