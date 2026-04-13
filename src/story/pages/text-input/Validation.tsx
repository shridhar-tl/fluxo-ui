import React, { useState } from 'react';
import { TextInput as TextInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextInput = withFieldLabel(TextInputRaw);

const code = `const [value, setValue] = useState('');
const [error, setError] = useState('');

const handleChange = (e) => {
  const newValue = e.target.value;
  setValue(newValue);

  if (newValue.length < 3 && newValue.length > 0) {
    setError('Must be at least 3 characters');
  } else {
    setError('');
  }
};

<TextInput
  label="Username"
  placeholder="Enter username"
  value={value}
  onChange={handleChange}
  error={error}
/>`;

const Validation: React.FC = () => {
    const [validatedValue, setValidatedValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleValidatedChange = (e: { value: string }) => {
        const val = e.value;
        setValidatedValue(val);

        if (val.length < 3 && val.length > 0) {
            setErrorMessage('Must be at least 3 characters');
        } else {
            setErrorMessage('');
        }
    };

    return (
        <>
            <ComponentDemo title="Input with Validation">
                <div className="w-full max-w-sm">
                    <TextInput
                        label="Username"
                        placeholder="Enter username"
                        value={validatedValue}
                        onChange={handleValidatedChange}
                        error={errorMessage}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default Validation;
