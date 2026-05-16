import React, { useState } from 'react';
import { FloatingLabelInput } from '../../../components';
import { EyeIcon, SearchIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<FloatingLabelInput label="Search" leadingIcon={<SearchIcon />} fullWidth />
<FloatingLabelInput label="Email" type="email" required fullWidth />
<FloatingLabelInput label="Password" type="password" trailingIcon={<EyeIcon />} fullWidth />
<FloatingLabelInput label="Username" errorText="That handle is taken" fullWidth />
<FloatingLabelInput label="Read-only" defaultValue="alice@example.com" disabled fullWidth />`;

const States: React.FC = () => {
    const [search, setSearch] = useState('');
    const [user, setUser] = useState('bob');
    return (
        <>
            <ComponentDemo title="Leading & trailing icons" description="Add icons inside the field — labels auto-shift to make room.">
                <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <FloatingLabelInput fullWidth label="Search" leadingIcon={<SearchIcon />} value={search} onChange={(e) => setSearch(e.target.value)} />
                    <FloatingLabelInput fullWidth label="Email" type="email" required />
                    <FloatingLabelInput fullWidth label="Password" type="password" trailingIcon={<EyeIcon />} />
                </div>
            </ComponentDemo>

            <ComponentDemo title="Error state" description="Pass errorText to highlight the field, render the message, and announce it via role=alert." className="mt-4">
                <div style={{ width: '100%', maxWidth: 360 }}>
                    <FloatingLabelInput fullWidth label="Username" value={user} onChange={(e) => setUser(e.target.value)} errorText="That handle is taken" />
                </div>
            </ComponentDemo>

            <ComponentDemo title="Disabled" description="Read-only fields fade out the wrapper but keep the label and value visible." className="mt-4">
                <div style={{ width: '100%', maxWidth: 360 }}>
                    <FloatingLabelInput fullWidth label="Email" defaultValue="alice@example.com" disabled />
                </div>
            </ComponentDemo>

            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default States;
