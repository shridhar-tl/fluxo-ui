import React from 'react';
import { NavBar, Button } from '../../../components';
import { MenuIcon, SearchIcon, SettingsIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<NavBar variant="standard" title="Standard" actions={...} onBack={...} />
<NavBar variant="centered" title="Centered" actions={...} onBack={...} />
<NavBar variant="large" title="Large title" actions={...} />
<NavBar variant="compact" title="Compact" actions={...} onBack={...} />`;

const frame: React.CSSProperties = {
    width: '100%',
    maxWidth: 380,
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 12,
    overflow: 'hidden',
    background: 'var(--eui-bg-subtle)',
};

const body = (
    <div style={{ padding: 16, minHeight: 80, color: 'var(--eui-text-muted)' }}>Body content</div>
);

const actions = (
    <>
        <Button leftIcon={SearchIcon} ariaLabel="Search" layout="plain" />
        <Button leftIcon={SettingsIcon} ariaLabel="Settings" layout="plain" />
    </>
);

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Standard" description="Title sits next to the leading area — default layout.">
            <div style={frame}>
                <NavBar variant="standard" title="Settings" onBack={() => undefined} actions={actions} />
                {body}
            </div>
        </ComponentDemo>

        <ComponentDemo title="Centered" description="Title is absolutely centered between leading and actions — iOS-style." className="mt-4">
            <div style={frame}>
                <NavBar variant="centered" title="Inbox" onBack={() => undefined} actions={actions} />
                {body}
            </div>
        </ComponentDemo>

        <ComponentDemo title="Large title" description="iOS-style large title rendered on its own row below the toolbar." className="mt-4">
            <div style={frame}>
                <NavBar variant="large" title="Library" subtitle="42 items" actions={actions} leading={<Button leftIcon={MenuIcon} ariaLabel="Menu" layout="plain" />} />
                {body}
            </div>
        </ComponentDemo>

        <ComponentDemo title="Compact" description="Slim toolbar — pairs well with embedded screens or dense layouts." className="mt-4">
            <div style={frame}>
                <NavBar variant="compact" title="Filters" onBack={() => undefined} actions={actions} />
                {body}
            </div>
        </ComponentDemo>

        <ComponentDemo title="Transparent" description="Use over hero imagery — drop background and border." className="mt-4">
            <div style={{ ...frame, background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
                <NavBar variant="transparent" title={<span style={{ color: '#fff' }}>Photo</span>} onBack={() => undefined} bordered={false} actions={(<Button leftIcon={SettingsIcon} ariaLabel="Settings" layout="plain" />)} />
                <div style={{ padding: 16, minHeight: 80, color: '#fff' }}>Hero image…</div>
            </div>
        </ComponentDemo>

        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Variants;
