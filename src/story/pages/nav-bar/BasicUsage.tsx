import React, { useState } from 'react';
import { NavBar, Button } from '../../../components';
import { SearchIcon, SettingsIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { NavBar, Button } from 'fluxo-ui';

<NavBar
    title="Inbox"
    subtitle="3 unread"
    onBack={goBack}
    actions={(
        <>
            <Button leftIcon={SearchIcon} ariaLabel="Search" layout="plain" />
            <Button leftIcon={SettingsIcon} ariaLabel="Settings" layout="plain" />
        </>
    )}
/>`;

const phoneFrame: React.CSSProperties = {
    width: '100%',
    maxWidth: 380,
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 12,
    overflow: 'hidden',
    background: 'var(--eui-bg-subtle)',
};

const BasicUsage: React.FC = () => {
    const [pings, setPings] = useState(0);
    return (
        <>
            <ComponentDemo title="Standard mobile nav bar" description="Back button on the left, title in the middle, action icons on the right.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={phoneFrame}>
                        <NavBar
                            title="Inbox"
                            subtitle="3 unread"
                            onBack={() => setPings((n) => n + 1)}
                            actions={(
                                <>
                                    <Button leftIcon={SearchIcon} ariaLabel="Search" layout="plain" />
                                    <Button leftIcon={SettingsIcon} ariaLabel="Settings" layout="plain" />
                                </>
                            )}
                        />
                        <div style={{ padding: 16, minHeight: 80, color: 'var(--eui-text-muted)' }}>
                            Page body content goes here.
                        </div>
                    </div>
                    <div style={{ padding: '10px 14px', background: 'var(--eui-bg-subtle)', border: '1px solid var(--eui-border-subtle)', borderRadius: 6, fontSize: 12, color: 'var(--eui-text-muted)' }}>
                        Back-button taps: <strong style={{ color: 'var(--eui-text)' }}>{pings}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default BasicUsage;
