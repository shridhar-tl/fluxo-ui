import React, { useState } from 'react';
import { PinInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PinInput length={4} variant="box" />
<PinInput length={4} variant="underline" />
<PinInput length={4} variant="soft" />`;

const Variants: React.FC = () => {
    const [box, setBox] = useState('');
    const [und, setUnd] = useState('');
    const [soft, setSoft] = useState('');
    return (
        <>
            <ComponentDemo title="Box (default)" description="Bordered tiles — most familiar OTP look.">
                <PinInput length={4} value={box} onChange={setBox} />
            </ComponentDemo>
            <ComponentDemo title="Underline" description="Only a bottom rule — minimal chrome for clean forms." className="mt-4">
                <PinInput length={4} variant="underline" value={und} onChange={setUnd} />
            </ComponentDemo>
            <ComponentDemo title="Soft" description="Filled background with no visible border — pairs well with light backgrounds." className="mt-4">
                <PinInput length={4} variant="soft" value={soft} onChange={setSoft} />
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default Variants;
