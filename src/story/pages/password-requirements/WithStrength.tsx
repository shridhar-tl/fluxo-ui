import React, { useState } from 'react';
import { Password, PasswordRequirements } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PasswordRequirements
  value={pw}
  confirm={cpw}
  showStrengthMeter
  strengthMeterProps={{ meterStyle: 'segments' }}
  policy={{ minLength: 10, minLowercase: 1, minUppercase: 1, minDigits: 1, minSymbols: 1 }}
  variant="card"
  title="Create a strong password"
/>`;

const WithStrength: React.FC = () => {
    const [pw, setPw] = useState('');
    const [cpw, setCpw] = useState('');
    return (
        <>
            <ComponentDemo
                title="Embedded Strength Meter"
                description="Set showStrengthMeter to bundle the strength meter inside the requirements component."
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
                        showStrengthMeter
                        strengthMeterProps={{ meterStyle: 'segments' }}
                        variant="card"
                        title="Create a strong password"
                        policy={{
                            minLength: 10,
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

export default WithStrength;
