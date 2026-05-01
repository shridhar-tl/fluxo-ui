import React from 'react';
import { Barcode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const formats: { format: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF'; value: string; note: string }[] = [
    { format: 'CODE128', value: 'FLUXO-UI-2026', note: 'Most flexible — alphanumeric + symbols' },
    { format: 'CODE39', value: 'FLUXO UI', note: '43-char uppercase alphabet' },
    { format: 'EAN13', value: '4006381333931', note: '12 or 13 digits, retail' },
    { format: 'EAN8', value: '12345670', note: '7 or 8 digits, small packages' },
    { format: 'UPC', value: '036000291452', note: '11 or 12 digits, US retail' },
    { format: 'ITF', value: '12345678', note: 'Even-length digits, logistics' },
];

const code = `<Barcode format="CODE128" value="FLUXO-UI-2026" />
<Barcode format="EAN13" value="4006381333931" />`;

const Formats: React.FC = () => (
    <>
        <ComponentDemo title="Supported Formats" description="Six 1D symbologies cover almost every use case.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, width: '100%' }}>
                {formats.map(({ format, value, note }) => (
                    <div
                        key={format}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            padding: 12,
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: 13 }}>{format}</strong>
                            <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>{note}</span>
                        </div>
                        <Barcode value={value} format={format} height={60} fontSize={12} />
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Formats;
