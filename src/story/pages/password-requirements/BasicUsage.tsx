import React, { useState } from 'react';
import { Password, PasswordRequirements } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Password, PasswordRequirements } from 'fluxo-ui';

const [pw, setPw] = useState('');
const [cpw, setCpw] = useState('');

<Password value={pw} onChange={(e) => setPw(e.value)} autoComplete="new-password" />
<Password value={cpw} onChange={(e) => setCpw(e.value)} autoComplete="new-password" placeholder="Confirm password" />

<PasswordRequirements
  value={pw}
  confirm={cpw}
  policy={{
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minDigits: 1,
    minSymbols: 1,
    maxConsecutiveRepeat: 2,
    maxConsecutiveSequence: 4,
  }}
/>`;

const BasicUsage: React.FC = () => {
    const [pw, setPw] = useState('');
    const [cpw, setCpw] = useState('');
    return (
        <>
            <ComponentDemo
                title="Default Requirements List"
                description="Type in both fields and watch each rule check itself off live."
            >
                <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Password
                        value={pw}
                        onChange={(e) => setPw(e.value)}
                        autoComplete="new-password"
                        placeholder="Password"
                    />
                    <Password
                        value={cpw}
                        onChange={(e) => setCpw(e.value)}
                        autoComplete="new-password"
                        placeholder="Confirm password"
                    />
                    <PasswordRequirements
                        value={pw}
                        confirm={cpw}
                        policy={{
                            minLength: 8,
                            minLowercase: 1,
                            minUppercase: 1,
                            minDigits: 1,
                            minSymbols: 1,
                            maxConsecutiveRepeat: 2,
                            maxConsecutiveSequence: 4,
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

export default BasicUsage;
