import React, { useState } from 'react';
import { PasswordRequirements } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PasswordRequirements
  value={pw}
  policy={{
    minLength: 12,
    maxLength: 64,
    minLowercase: 2,
    minUppercase: 2,
    minDigits: 2,
    minSymbols: 1,
    allowedSymbols: '!@#$%&*',
    forbidWhitespace: true,
    maxConsecutiveRepeat: 2,
    maxConsecutiveSequence: 4,
  }}
/>`;

const Configurable: React.FC = () => {
    const [pw, setPw] = useState('');
    const [minLength, setMinLength] = useState(12);
    const [minSymbols, setMinSymbols] = useState(1);
    const [allowedSymbols, setAllowedSymbols] = useState('!@#$%&*');
    const [forbidWhitespace, setForbidWhitespace] = useState(true);
    const [maxRepeat, setMaxRepeat] = useState(2);
    const [maxSeq, setMaxSeq] = useState(4);

    return (
        <>
            <ComponentDemo
                title="Live Policy Tuning"
                description="Drive every built-in rule with controls so you can see how each setting changes the checklist."
            >
                <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 14 }}>
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

                    <PasswordRequirements
                        value={pw}
                        policy={{
                            minLength,
                            maxLength: 64,
                            minLowercase: 2,
                            minUppercase: 2,
                            minDigits: 2,
                            minSymbols,
                            allowedSymbols,
                            forbidWhitespace,
                            maxConsecutiveRepeat: maxRepeat,
                            maxConsecutiveSequence: maxSeq,
                        }}
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
                        <label htmlFor="pr-minl">Min length</label>
                        <input id="pr-minl" type="range" min={4} max={32} value={minLength} onChange={(e) => setMinLength(Number(e.target.value))} />
                        <span>{minLength}</span>

                        <label htmlFor="pr-minsym">Min symbols</label>
                        <input id="pr-minsym" type="range" min={0} max={4} value={minSymbols} onChange={(e) => setMinSymbols(Number(e.target.value))} />
                        <span>{minSymbols}</span>

                        <label htmlFor="pr-syms">Allowed symbols</label>
                        <input
                            id="pr-syms"
                            type="text"
                            value={allowedSymbols}
                            onChange={(e) => setAllowedSymbols(e.target.value)}
                            style={{
                                padding: '4px 8px',
                                borderRadius: 4,
                                border: '1px solid var(--eui-border)',
                                background: 'var(--eui-bg)',
                                color: 'var(--eui-text)',
                                fontFamily: 'monospace',
                            }}
                        />
                        <span style={{ fontFamily: 'monospace' }}>{allowedSymbols.length}</span>

                        <label htmlFor="pr-ws">Forbid whitespace</label>
                        <input id="pr-ws" type="checkbox" checked={forbidWhitespace} onChange={(e) => setForbidWhitespace(e.target.checked)} />
                        <span>{forbidWhitespace ? 'on' : 'off'}</span>

                        <label htmlFor="pr-repeat">Max repeat</label>
                        <input id="pr-repeat" type="range" min={0} max={5} value={maxRepeat} onChange={(e) => setMaxRepeat(Number(e.target.value))} />
                        <span>{maxRepeat || 'off'}</span>

                        <label htmlFor="pr-seq">Max sequence</label>
                        <input id="pr-seq" type="range" min={0} max={6} value={maxSeq} onChange={(e) => setMaxSeq(Number(e.target.value))} />
                        <span>{maxSeq || 'off'}</span>
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
