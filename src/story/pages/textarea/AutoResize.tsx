import React, { useState } from 'react';
import { TextArea as TextAreaRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextArea = withFieldLabel(TextAreaRaw);

const code = `<TextArea
  label="Comments"
  placeholder="Start typing and watch it grow..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  autoResize
  rows={2}
/>`;

const AutoResize: React.FC = () => {
    const [autoResizeValue, setAutoResizeValue] = useState('');

    return (
        <>
            <ComponentDemo title="Auto-resizing TextArea">
                <div className="w-full max-w-sm">
                    <TextArea
                        label="Comments"
                        placeholder="Start typing and watch it grow..."
                        value={autoResizeValue}
                        onChange={(e) => setAutoResizeValue(e.value)}
                        autoResize
                        rows={2}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default AutoResize;
