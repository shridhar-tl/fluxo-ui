import React from 'react';
import { QRCode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<QRCode
  value="https://fluxo-ui.utilsware.com/components/qr-code"
  size={240}
  moduleShape="rounded"
  logo={{ src: '/logo.svg', size: 48, padding: 6, rounded: true }}
/>
<QRCode
  value="WIFI:T:WPA;S:FluxoGuest;P:welcome2025;;"
  size={240}
  moduleShape="dots"
  foreground="#7c3aed"
  logo={{ src: '/logo.svg', size: 56, padding: 8, rounded: true }}
/>`;

const valueLabelStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 11,
    color: 'var(--eui-text)',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 4,
    padding: '4px 8px',
    maxWidth: 240,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const examples = [
    {
        value: 'https://fluxo-ui.utilsware.com/components/qr-code',
        label: 'Docs link · rounded',
        shape: 'rounded' as const,
        logoSize: 48,
        padding: 6,
        foreground: undefined,
    },
    {
        value: 'WIFI:T:WPA;S:FluxoGuest;P:welcome2025;;',
        label: 'Wi-Fi credentials · dots',
        shape: 'dots' as const,
        logoSize: 56,
        padding: 8,
        foreground: '#7c3aed',
    },
];

const WithLogo: React.FC = () => (
    <>
        <ComponentDemo
            title="Logo Overlay"
            description="When a logo is supplied, errorCorrection auto-bumps to 'H' so the code stays scannable. Each example encodes a different payload."
        >
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
                {examples.map((ex) => (
                    <div key={ex.label} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                        <QRCode
                            value={ex.value}
                            size={240}
                            moduleShape={ex.shape}
                            foreground={ex.foreground}
                            logo={{ src: '/logo.svg', size: ex.logoSize, padding: ex.padding, rounded: true }}
                        />
                        <span style={{ fontSize: 12, color: 'var(--eui-text-muted)', fontWeight: 600 }}>{ex.label}</span>
                        <div style={valueLabelStyle} title={ex.value}>
                            {ex.value}
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

export default WithLogo;
