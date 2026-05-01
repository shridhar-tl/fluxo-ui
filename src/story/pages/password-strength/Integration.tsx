import React, { useState } from 'react';
import { Password } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Password
  value={pw}
  onChange={(e) => setPw(e.value)}
  autoComplete="new-password"
  strengthMeter={{
    policy: { minLength: 10, requireSymbol: true },
    meterStyle: 'segments',
  }}
/>`;

const Integration: React.FC = () => {
    const [pw, setPw] = useState('');
    return (
        <>
            <ComponentDemo
                title="Integrated with Password"
                description="Pass strengthMeter (boolean or props) to render the meter inline below the input. The toggle button restores focus to the input."
            >
                <form
                    onSubmit={(e) => e.preventDefault()}
                    style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                    <label htmlFor="signup-pw" style={{ fontSize: 13, color: 'var(--eui-text)' }}>
                        Create a password
                    </label>
                    <Password
                        id="signup-pw"
                        name="newPassword"
                        value={pw}
                        onChange={(e) => setPw(e.value)}
                        autoComplete="new-password"
                        strengthMeter={{
                            policy: { minLength: 10, targetLength: 16, requireSymbol: true },
                            meterStyle: 'segments',
                        }}
                        placeholder="At least 10 characters, one symbol"
                    />
                </form>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Integration;
