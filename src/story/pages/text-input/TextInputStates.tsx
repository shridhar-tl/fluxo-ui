import React from 'react';
import { TextInput as TextInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextInput = withFieldLabel(TextInputRaw);

const code = `<TextInput label="Normal" placeholder="Normal state" value={value} onChange={(e) => setValue(e.value)} />
<TextInput label="Disabled" placeholder="Disabled state" value={value} onChange={(e) => setValue(e.value)} disabled />
<TextInput label="Read Only" value="Read only value" readonly onChange={(e) => setValue(e.value)} />
<TextInput label="Required" placeholder="Required field" value={value} onChange={(e) => setValue(e.value)} required />`;

const TextInputStates: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Input States">
                <div className="w-full max-w-sm space-y-4">
                    <TextInput label="Normal" placeholder="Normal state" />
                    <TextInput label="Disabled" placeholder="Disabled state" disabled />
                    <TextInput label="Read Only" value="Read only value" readonly />
                    <TextInput label="Required" placeholder="Required field" required />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default TextInputStates;
