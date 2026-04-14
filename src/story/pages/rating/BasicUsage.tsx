import React, { useState } from 'react';
import { Rating } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Rating } from 'fluxo-ui';

const [value, setValue] = useState(3);

<Rating value={value} onChange={setValue} />

<Rating defaultValue={4} showValue />

<Rating defaultValue={3.5} precision={0.5} showValue />`;

const BasicUsage: React.FC = () => {
    const [value, setValue] = useState(3);

    return (
        <>
            <ComponentDemo title="Default Rating" description="Click a star to set the value. Click the same star again to clear.">
                <div className="space-y-6">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Controlled (value: {value})</div>
                        <Rating value={value} onChange={setValue} />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Uncontrolled with value display</div>
                        <Rating defaultValue={4} showValue />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Half-star precision</div>
                        <Rating defaultValue={3.5} precision={0.5} showValue />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Read-only</div>
                        <Rating value={4} readOnly showValue />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Disabled</div>
                        <Rating value={3} disabled />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
