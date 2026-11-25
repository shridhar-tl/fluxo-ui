import React from 'react';

import { AnnouncementIcon, ShieldIcon, TrophyIcon } from '../../../assets/icons';
import { Alert, Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, stackStyle } from '../../demo-styles';

const frameStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid var(--eui-border-subtle)',
    background: 'var(--eui-bg)',
};

const code = `<Alert banner type="info" variant="solid" icon={AnnouncementIcon} closable
    title="FluxoUI 2.0 is here" description="Explore the new components." />

<Alert color="#7c3aed" variant="left-accent" icon={TrophyIcon} title="Achievement unlocked" />
<Alert type="neutral" icon={false} title="No icon" />
<Alert type="warning" role="none" title="Static notice" />`;

const BannerCustom: React.FC = () => (
    <>
        <ComponentDemo title="Banners, Custom Colors & Icons" description="Full-width banners for page-level messages, any brand color, custom or hidden icons.">
            <div style={stackStyle}>
                <span style={rowLabelStyle}>Banner</span>
                <div style={frameStyle}>
                    <Alert
                        banner
                        type="info"
                        variant="solid"
                        icon={AnnouncementIcon}
                        closable
                        title="FluxoUI 2.0 is here"
                        description="Explore seven new components and refreshed themes."
                        actionsPlacement="inline"
                        actions={<Button label="What's new" size="sm" />}
                    />
                    <div style={{ padding: '1.25rem', color: 'var(--eui-text-muted)', fontSize: '0.875rem' }}>Page content sits below the banner.</div>
                </div>
                <span style={rowLabelStyle}>Custom colors</span>
                <Alert color="#7c3aed" variant="left-accent" icon={TrophyIcon} title="Achievement unlocked" description="You closed 100 tickets this month." />
                <Alert color="#0d9488" variant="soft" icon={ShieldIcon} title="Security review passed" description="All 24 checks completed without findings." />
                <Alert color="#db2777" variant="solid" title="Limited offer" description="Get 40% off annual plans until Friday." />
                <span style={rowLabelStyle}>Without icon</span>
                <Alert type="neutral" variant="minimal" icon={false} title="Draft saved" description="Last saved 2 minutes ago." />
                <Alert type="success" size="sm" icon={false} description="A compact message without title or icon." />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BannerCustom;
