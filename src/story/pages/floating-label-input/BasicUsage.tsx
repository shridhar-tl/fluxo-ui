import React, { useState } from 'react';
import { FloatingLabelInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { FloatingLabelInput } from 'fluxo-ui';

<FloatingLabelInput
    label="Email address"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    helperText="We'll never share your email."
/>`;

const BasicUsage: React.FC = () => {
    const [email, setEmail] = useState('');
    return (
        <>
            <ComponentDemo title="Default outlined input" description="The label floats above the field on focus or when it has a value — saves a full row of label height on mobile screens.">
                <div style={{ width: '100%', maxWidth: 360 }}>
                    <FloatingLabelInput
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        helperText="We'll never share your email."
                        fullWidth
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default BasicUsage;
