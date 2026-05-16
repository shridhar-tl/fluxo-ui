import React, { useState } from 'react';
import { FloatingLabelInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<FloatingLabelInput label="Outlined" variant="outlined" />
<FloatingLabelInput label="Filled" variant="filled" />
<FloatingLabelInput label="Underlined" variant="underlined" />`;

const Variants: React.FC = () => {
    const [out, setOut] = useState('');
    const [fil, setFil] = useState('');
    const [und, setUnd] = useState('');
    return (
        <>
            <ComponentDemo title="Outlined (default)" description="Borders on all four sides with the floating label cutting through the top border.">
                <div style={{ width: '100%', maxWidth: 360 }}><FloatingLabelInput fullWidth label="Full name" variant="outlined" value={out} onChange={(e) => setOut(e.target.value)} /></div>
            </ComponentDemo>
            <ComponentDemo title="Filled" description="A subtle background fills the field, with only the bottom border visible — a denser, Android-style look." className="mt-4">
                <div style={{ width: '100%', maxWidth: 360 }}><FloatingLabelInput fullWidth label="Address line 1" variant="filled" value={fil} onChange={(e) => setFil(e.target.value)} /></div>
            </ComponentDemo>
            <ComponentDemo title="Underlined" description="Only the bottom border — works well on transparent surfaces." className="mt-4">
                <div style={{ width: '100%', maxWidth: 360 }}><FloatingLabelInput fullWidth label="Pet name" variant="underlined" value={und} onChange={(e) => setUnd(e.target.value)} /></div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default Variants;
