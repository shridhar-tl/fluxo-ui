import React, { useState } from 'react';
import { PinInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PinInput length={6} size="sm" />
<PinInput length={6} size="md" />
<PinInput length={6} size="lg" />`;

const Sizes: React.FC = () => {
    const [sm, setSm] = useState('');
    const [md, setMd] = useState('');
    const [lg, setLg] = useState('');
    return (
        <>
            <ComponentDemo title="Small" description="Compact fields for inline forms.">
                <PinInput length={6} size="sm" value={sm} onChange={setSm} />
            </ComponentDemo>
            <ComponentDemo title="Medium (default)" description="Balanced size for typical OTP screens." className="mt-4">
                <PinInput length={6} size="md" value={md} onChange={setMd} />
            </ComponentDemo>
            <ComponentDemo title="Large" description="Bigger touch targets — ideal for sign-in screens on mobile." className="mt-4">
                <PinInput length={6} size="lg" value={lg} onChange={setLg} />
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default Sizes;
