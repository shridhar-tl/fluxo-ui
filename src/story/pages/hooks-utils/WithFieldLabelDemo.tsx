import React, { useState } from 'react';
import { TextInput } from '../../../components';
import type { ComponentEvent } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { withFieldLabel } from 'ether-ui/utils';
import { TextInput } from 'ether-ui';

const LabeledTextInput = withFieldLabel(TextInput);

<LabeledTextInput
  label="Email Address"
  required
  hint="We'll never share your email"
  error={error}
  placeholder="you@example.com"
/>`;

const LabeledTextInput = withFieldLabel(TextInput);

const WithFieldLabelDemo: React.FC = () => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: ComponentEvent<string>) => {
        const val = e.value;
        setValue(val);
        if (val && !val.includes('@')) {
            setError('Please enter a valid email address');
        } else {
            setError('');
        }
    };

    return (
        <>
            <ComponentDemo title="withFieldLabel" description="Higher-order component that wraps any input component with a FieldLabel, adding label, required, error, and hint props.">
                <div className="max-w-sm space-y-4">
                    <LabeledTextInput
                        label="Email Address"
                        required
                        hint="We'll never share your email"
                        error={error}
                        placeholder="you@example.com"
                        value={value}
                        onChange={handleChange}
                    />

                    <LabeledTextInput
                        label="Username"
                        placeholder="johndoe"
                    />

                    <LabeledTextInput
                        label="Disabled Field"
                        disabled
                        placeholder="Cannot edit"
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default WithFieldLabelDemo;
