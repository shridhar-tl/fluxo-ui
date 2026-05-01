import React, { useState } from 'react';
import { Barcode, BarcodeFormat } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const formatExamples: Record<BarcodeFormat, string> = {
    CODE128: 'FLUXO-UI-2026',
    CODE39: 'FLUXO UI',
    EAN13: '4006381333931',
    EAN8: '12345670',
    UPC: '036000291452',
    ITF: '12345678',
};

const code = `<Barcode value="FLUXO-UI-2026" format="CODE128" />`;

const BasicUsage: React.FC = () => {
    const [format, setFormat] = useState<BarcodeFormat>('CODE128');
    const [value, setValue] = useState(formatExamples.CODE128);
    const [error, setError] = useState<string | null>(null);

    const handleFormatChange = (next: BarcodeFormat) => {
        setFormat(next);
        setValue(formatExamples[next]);
        setError(null);
    };

    return (
        <>
            <ComponentDemo
                title="Default Barcode"
                description="Pick a format, type your value, and scan with a barcode reader app on your phone to verify. Invalid inputs render an inline error."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <Barcode
                        value={value}
                        format={format}
                        width={3}
                        height={110}
                        fontSize={16}
                        onError={(err) => setError(err.message)}
                    />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr',
                            gap: 12,
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            width: '100%',
                            maxWidth: 520,
                            fontSize: 13,
                        }}
                    >
                        <label htmlFor="bc-fmt">Format</label>
                        <select
                            id="bc-fmt"
                            value={format}
                            onChange={(e) => handleFormatChange(e.target.value as BarcodeFormat)}
                            style={{ padding: '4px 8px', borderRadius: 4 }}
                        >
                            {(Object.keys(formatExamples) as BarcodeFormat[]).map((f) => (
                                <option key={f} value={f}>
                                    {f}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="bc-val">Value</label>
                        <input
                            id="bc-val"
                            type="text"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                setError(null);
                            }}
                            style={{
                                padding: '4px 8px',
                                borderRadius: 4,
                                border: '1px solid var(--eui-border)',
                                background: 'var(--eui-bg)',
                                color: 'var(--eui-text)',
                            }}
                        />

                        {error && (
                            <span style={{ gridColumn: '1 / -1', color: '#ef4444', fontSize: 12 }}>
                                {error}
                            </span>
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
