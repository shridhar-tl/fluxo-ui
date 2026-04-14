import React, { useState } from 'react';
import { Rating } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Rating precision={1} defaultValue={3} showValue />

<Rating precision={0.5} defaultValue={3.5} showValue />

<Rating precision={0.1} defaultValue={3.7} showValue />`;

const Precision: React.FC = () => {
    const [halfValue, setHalfValue] = useState(3.5);
    const [decValue, setDecValue] = useState(3.7);

    return (
        <>
            <ComponentDemo title="Precision" description="Click anywhere on a star to set fractional values. Supports 1, 0.5, or 0.1 precision.">
                <div className="space-y-6">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Whole (precision={1})</div>
                        <Rating precision={1} defaultValue={3} showValue />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Half ({halfValue})</div>
                        <Rating precision={0.5} value={halfValue} onChange={setHalfValue} showValue />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Decimal ({decValue.toFixed(1)})</div>
                        <Rating precision={0.1} value={decValue} onChange={setDecValue} showValue />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Precision;
