import React, { useState } from 'react';
import { PasswordRequirements, PasswordRequirementsIconStyle, PasswordRequirementsVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PasswordRequirements value={pw} variant="list" iconStyle="check" policy={policy} />
<PasswordRequirements value={pw} variant="inline" iconStyle="dot" policy={policy} />
<PasswordRequirements value={pw} variant="card" iconStyle="numeric" policy={policy} title="Password rules" />`;

const variants: PasswordRequirementsVariant[] = ['list', 'inline', 'card'];
const iconStyles: PasswordRequirementsIconStyle[] = ['check', 'dot', 'numeric'];

const Variants: React.FC = () => {
    const [pw, setPw] = useState('helloWorld!');
    return (
        <>
            <ComponentDemo
                title="Variants × Icon Styles"
                description="Three visual variants × three icon styles. Pick what fits your form layout."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                            maxWidth: 480,
                        }}
                    />
                    {variants.map((v) =>
                        iconStyles.map((icon) => (
                            <div
                                key={`${v}-${icon}`}
                                style={{
                                    padding: '12px 14px',
                                    background: 'var(--eui-bg-subtle)',
                                    border: '1px solid var(--eui-border-subtle)',
                                    borderRadius: 6,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--eui-text-muted)',
                                        marginBottom: 8,
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    variant="{v}" iconStyle="{icon}"
                                </div>
                                <PasswordRequirements
                                    value={pw}
                                    variant={v}
                                    iconStyle={icon}
                                    title="Requirements"
                                    policy={{
                                        minLength: 8,
                                        minLowercase: 1,
                                        minUppercase: 1,
                                        minDigits: 1,
                                        minSymbols: 1,
                                    }}
                                />
                            </div>
                        )),
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Variants;
