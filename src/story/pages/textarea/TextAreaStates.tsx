import React from 'react';
import { TextArea as TextAreaRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextArea = withFieldLabel(TextAreaRaw);

const code = `<TextArea label="Normal" placeholder="Normal state" value={value} onChange={(e) => setValue(e.value)} />
<TextArea label="Disabled" placeholder="Disabled state" value={value} onChange={(e) => setValue(e.value)} disabled />
<TextArea label="Read Only" value="This is read-only content" readonly onChange={(e) => setValue(e.value)} />
<TextArea label="Required" placeholder="Required field" value={value} onChange={(e) => setValue(e.value)} required />
<TextArea label="With Error" error="This field is required" value={value} onChange={(e) => setValue(e.value)} />`;

const TextAreaStates: React.FC = () => {
    return (
        <>
            <ComponentDemo title="TextArea States">
                <div className="w-full max-w-sm space-y-4">
                    <TextArea label="Normal" placeholder="Normal state" />
                    <TextArea label="Disabled" placeholder="Disabled state" disabled />
                    <TextArea label="Read Only" value="This is read-only content" readonly />
                    <TextArea label="Required" placeholder="Required field" required />
                    <TextArea label="With Error" error="This field is required" />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default TextAreaStates;
