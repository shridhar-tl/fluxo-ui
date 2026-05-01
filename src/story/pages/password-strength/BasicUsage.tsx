import React, { useState } from 'react';
import { Password, PasswordStrengthMeter } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { PasswordStrengthMeter } from 'fluxo-ui';

const [pw, setPw] = useState('');

<Password value={pw} onChange={(e) => setPw(e.value)} placeholder="Enter password" />
<PasswordStrengthMeter value={pw} />`;

const BasicUsage: React.FC = () => {
    const [pw, setPw] = useState('');
    return (
        <>
            <ComponentDemo title="Default Strength Meter" description="Type to see live tier and tip updates.">
                <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Password
                        value={pw}
                        onChange={(e) => setPw(e.value)}
                        placeholder="Enter a password"
                        autoComplete="new-password"
                    />
                    <PasswordStrengthMeter value={pw} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
