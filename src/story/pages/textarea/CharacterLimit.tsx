import React, { useState } from 'react';
import { TextArea as TextAreaRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextArea = withFieldLabel(TextAreaRaw);

const code = `<TextArea
  label="Bio"
  placeholder="Tell us about yourself..."
  value={value}
  onChange={(e) => setValue(e.value)}
  maxLength={150}
/>`;

const CharacterLimit: React.FC = () => {
    const [countedValue, setCountedValue] = useState('');

    return (
        <>
            <ComponentDemo title="TextArea with Character Limit">
                <div className="w-full max-w-sm">
                    <TextArea
                        label="Bio"
                        placeholder="Tell us about yourself..."
                        value={countedValue}
                        onChange={(e) => setCountedValue(e.value)}
                        maxLength={150}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default CharacterLimit;
