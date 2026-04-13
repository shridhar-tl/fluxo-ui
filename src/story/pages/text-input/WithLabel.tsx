import React, { useState } from 'react';
import { TextInput as TextInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextInput = withFieldLabel(TextInputRaw);

const code = `<TextInput
  label="Full Name"
  placeholder="John Doe"
/>`;

const WithLabel: React.FC = () => {
    const [withLabelValue, setWithLabelValue] = useState('');

    return (
        <>
            <ComponentDemo title="Text Input with Label">
                <div className="w-full max-w-sm">
                    <TextInput
                        label="Full Name"
                        placeholder="John Doe"
                        value={withLabelValue}
                        onChange={(e) => setWithLabelValue(e.value)}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default WithLabel;
