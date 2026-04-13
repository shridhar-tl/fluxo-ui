import React from 'react';
import { Password as PasswordRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const Password = withFieldLabel(PasswordRaw);

const code = `<Password
  label="Normal"
  placeholder="Enter password"
  value={password}
  onChange={(e) => setPassword(e.value)}
/>
<Password
  label="Disabled"
  placeholder="Disabled"
  value={password}
  onChange={(e) => setPassword(e.value)}
  disabled
/>`;

const PasswordStates: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Password Input States">
                <div className="w-full max-w-sm space-y-4">
                    <Password label="Normal" placeholder="Enter password" />
                    <Password label="Disabled" placeholder="Disabled" disabled />
                    <Password label="Read Only" value="secret123" readonly />
                    <Password label="Required" placeholder="Enter password" required />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default PasswordStates;
