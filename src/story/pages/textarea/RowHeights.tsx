import React from 'react';
import { TextArea as TextAreaRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const TextArea = withFieldLabel(TextAreaRaw);

const code = `<TextArea label="Short (2 rows)" rows={2} placeholder="2 rows high" />
<TextArea label="Medium (4 rows)" rows={4} placeholder="4 rows high" />
<TextArea label="Tall (8 rows)" rows={8} placeholder="8 rows high" />`;

const RowHeights: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Different Row Heights">
                <div className="w-full max-w-sm space-y-4">
                    <TextArea label="Short (2 rows)" rows={2} placeholder="2 rows high" />
                    <TextArea label="Medium (4 rows)" rows={4} placeholder="4 rows high" />
                    <TextArea label="Tall (8 rows)" rows={8} placeholder="8 rows high" />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default RowHeights;
