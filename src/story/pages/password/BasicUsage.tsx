import React, { useState } from 'react';
import { Password as PasswordRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const Password = withFieldLabel(PasswordRaw);

const code = `import { Password } from 'ether-ui';

function MyComponent() {
  const [password, setPassword] = useState('');

  return (
    <Password
      label="Password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const [basicPassword, setBasicPassword] = useState('');

    return (
        <>
            <ComponentDemo title="Basic Password Input">
                <div className="w-full max-w-sm">
                    <Password
                        label="Password"
                        placeholder="Enter your password"
                        value={basicPassword}
                        onChange={(e) => setBasicPassword(e.value)}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
