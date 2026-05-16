import React, { useState } from 'react';
import { PinInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PinInput length={6} groupAfter={3} type="numeric" />
<PinInput length={8} type="alphanumeric" mask />
<PinInput length={4} type="password" placeholder="•" />
<PinInput length={6} invalid errorText="Incorrect code" />`;

const Advanced: React.FC = () => {
    const [grouped, setGrouped] = useState('');
    const [alpha, setAlpha] = useState('');
    const [pwd, setPwd] = useState('');
    const [bad, setBad] = useState('123');

    return (
        <>
            <ComponentDemo title="Grouped digits" description="Insert a visual separator every N fields with groupAfter.">
                <PinInput length={6} groupAfter={3} value={grouped} onChange={setGrouped} />
            </ComponentDemo>

            <ComponentDemo title="Alphanumeric + masked" description="type='alphanumeric' allows letters and digits; mask hides characters as dots." className="mt-4">
                <PinInput length={8} type="alphanumeric" mask value={alpha} onChange={setAlpha} />
            </ComponentDemo>

            <ComponentDemo title="Password with placeholder" description="Use type='password' for secret codes; add a placeholder character to indicate empty slots." className="mt-4">
                <PinInput length={4} type="password" placeholder="•" value={pwd} onChange={setPwd} />
            </ComponentDemo>

            <ComponentDemo title="Error state" description="Mark the group invalid and add an errorText to announce the issue via role=alert." className="mt-4">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <PinInput length={6} invalid value={bad} onChange={setBad} />
                    <div role="alert" style={{ fontSize: 12, color: '#ef4444' }}>Incorrect code — please try again</div>
                </div>
            </ComponentDemo>

            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default Advanced;
