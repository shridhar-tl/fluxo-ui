import React, { useState } from 'react';
import { PasswordStrengthMeter } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PasswordStrengthMeter
  value={pw}
  policy={{ minLength: 6, targetLength: 12, requireSymbol: false }}
  allowedChars={{ lowercase: true, uppercase: true, digits: true, symbols: false }}
  thresholds={{ fair: 30, good: 55, strong: 80 }}
/>`;

const Configurable: React.FC = () => {
    const [pw, setPw] = useState('');
    const [requireSymbol, setRequireSymbol] = useState(false);
    const [allowSymbols, setAllowSymbols] = useState(false);
    const [minLength, setMinLength] = useState(8);
    const [targetLength, setTargetLength] = useState(14);

    return (
        <>
            <ComponentDemo
                title="Configurable Rules"
                description="Toggle whether symbols are allowed/required and watch tips update — they only ever ask for things the field actually accepts."
            >
                <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    <PasswordStrengthMeter
                        value={pw}
                        policy={{
                            minLength,
                            targetLength,
                            requireLowercase: true,
                            requireUppercase: true,
                            requireDigit: true,
                            requireSymbol,
                        }}
                        allowedChars={{ lowercase: true, uppercase: true, digits: true, symbols: allowSymbols }}
                    />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto',
                            gap: 12,
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                        }}
                    >
                        <label htmlFor="ps-min">Min length</label>
                        <input
                            id="ps-min"
                            type="range"
                            min={4}
                            max={16}
                            value={minLength}
                            onChange={(e) => setMinLength(Number(e.target.value))}
                        />
                        <span>{minLength}</span>

                        <label htmlFor="ps-target">Target length</label>
                        <input
                            id="ps-target"
                            type="range"
                            min={8}
                            max={24}
                            value={targetLength}
                            onChange={(e) => setTargetLength(Number(e.target.value))}
                        />
                        <span>{targetLength}</span>

                        <label htmlFor="ps-allow-sym">Allow symbols</label>
                        <input
                            id="ps-allow-sym"
                            type="checkbox"
                            checked={allowSymbols}
                            onChange={(e) => setAllowSymbols(e.target.checked)}
                        />
                        <span>{allowSymbols ? 'on' : 'off'}</span>

                        <label htmlFor="ps-req-sym">Require symbol</label>
                        <input
                            id="ps-req-sym"
                            type="checkbox"
                            checked={requireSymbol}
                            disabled={!allowSymbols}
                            onChange={(e) => setRequireSymbol(e.target.checked)}
                        />
                        <span>{requireSymbol ? 'yes' : 'no'}</span>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Configurable;
