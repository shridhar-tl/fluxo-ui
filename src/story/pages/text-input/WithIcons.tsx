import React from 'react';
import { TextInput as TextInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextInput = withFieldLabel(TextInputRaw);

const code = `<TextInput
  label="Search"
  placeholder="Search..."
  rightIcon={<span>🔍</span>}
  value={value}
  onChange={(e) => setValue(e.value)}
/>
<TextInput
  label="Email"
  placeholder="user@example.com"
  leftIcon={<span>✉</span>}
  value={value}
  onChange={(e) => setValue(e.value)}
/>`;

const WithIcons: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Text Input with Icons">
                <div className="w-full max-w-sm space-y-4">
                    <TextInput label="Search" placeholder="Search..." rightIcon={<span>🔍</span>} />
                    <TextInput label="Email" placeholder="user@example.com" leftIcon={<span>✉</span>} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default WithIcons;
