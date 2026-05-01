import React, { useState } from 'react';
import { PasswordStrengthMeter, PasswordStrengthMeterStyle } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PasswordStrengthMeter value={pw} meterStyle="segments" />
<PasswordStrengthMeter value={pw} meterStyle="bar" />
<PasswordStrengthMeter value={pw} meterStyle="minimal" />`;

const styles: PasswordStrengthMeterStyle[] = ['segments', 'bar', 'minimal'];

const Variants: React.FC = () => {
    const [pw, setPw] = useState('Password1!');
    return (
        <>
            <ComponentDemo title="Meter Styles" description="Three visual treatments — pick the one that fits your form density.">
                <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <input
                        type="text"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        placeholder="Type a password"
                        style={{
                            padding: '6px 10px',
                            borderRadius: 4,
                            border: '1px solid var(--eui-border)',
                            background: 'var(--eui-bg)',
                            color: 'var(--eui-text)',
                            fontSize: 14,
                            fontFamily: 'inherit',
                        }}
                    />
                    {styles.map((s) => (
                        <div
                            key={s}
                            style={{
                                padding: '12px 14px',
                                background: 'var(--eui-bg-subtle)',
                                border: '1px solid var(--eui-border-subtle)',
                                borderRadius: 6,
                            }}
                        >
                            <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', marginBottom: 8 }}>
                                meterStyle="{s}"
                            </div>
                            <PasswordStrengthMeter value={pw} meterStyle={s} />
                        </div>
                    ))}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Variants;
