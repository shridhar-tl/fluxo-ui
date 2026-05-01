import React, { useState } from 'react';
import { PasswordRequirements } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PasswordRequirements
  value={pin}
  policy={{
    numericOnly: true,
    minLength: 6,
    maxLength: 6,
    maxConsecutiveRepeat: 2,
    maxConsecutiveSequence: 3,
  }}
  variant="card"
  title="Set a 6-digit PIN"
/>`;

const NumericPin: React.FC = () => {
    const [pin, setPin] = useState('');
    return (
        <>
            <ComponentDemo
                title="Numeric PIN Use Case"
                description="numericOnly + min/max length + repeat/sequence limits — perfect for a banking PIN form."
            >
                <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit PIN"
                        maxLength={6}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 4,
                            border: '1px solid var(--eui-border)',
                            background: 'var(--eui-bg)',
                            color: 'var(--eui-text)',
                            fontSize: 18,
                            letterSpacing: 4,
                            fontFamily: 'monospace',
                            textAlign: 'center',
                        }}
                    />
                    <PasswordRequirements
                        value={pin}
                        variant="card"
                        title="Set a 6-digit PIN"
                        policy={{
                            numericOnly: true,
                            minLength: 6,
                            maxLength: 6,
                            maxConsecutiveRepeat: 2,
                            maxConsecutiveSequence: 3,
                        }}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default NumericPin;
