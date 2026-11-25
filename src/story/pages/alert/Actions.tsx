import React, { useState } from 'react';

import { Alert, Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, stackStyle } from '../../demo-styles';
import { buildLog } from './alert-story-data';

const logStyle: React.CSSProperties = {
    margin: 0,
    padding: '0.75rem',
    borderRadius: '0.5rem',
    background: 'var(--eui-bg-subtle)',
    color: 'var(--eui-text)',
    fontSize: '0.75rem',
    lineHeight: 1.6,
    overflowX: 'auto',
    whiteSpace: 'pre',
};

const code = `<Alert
    type="warning"
    title="Your trial ends in 3 days"
    description="Upgrade to keep access to premium features."
    actionsPlacement="inline"
    actions={<Button label="Upgrade" size="sm" variant="warning" />}
/>

<Alert
    type="error"
    title="Deployment failed"
    description="The build step exited with code 1."
    details={<pre>{buildLog}</pre>}
    actions={<><Button label="Retry" size="sm" variant="danger" /><Button label="View logs" size="sm" layout="outlined" /></>}
/>

<Alert type="info" title="What's included" headingLevel={2} details={<FeatureList />} defaultExpanded />`;

const Actions: React.FC = () => {
    const [event, setEvent] = useState<string | null>(null);

    return (
        <>
            <ComponentDemo title="Actions & Expandable Details" description="Add inline or bottom actions, and tuck long technical details behind a disclosure.">
                <div style={stackStyle}>
                    <Alert
                        type="warning"
                        title="Your trial ends in 3 days"
                        description="Upgrade to keep access to premium features."
                        actionsPlacement="inline"
                        actions={<Button label="Upgrade" size="sm" variant="warning" onClick={() => setEvent('Upgrade clicked')} />}
                    />
                    <Alert
                        type="error"
                        variant="outline"
                        title="Deployment failed"
                        description="The build step exited with code 1."
                        details={<pre style={logStyle}>{buildLog}</pre>}
                        detailsLabel="Show build log"
                        hideDetailsLabel="Hide build log"
                        actions={
                            <>
                                <Button label="Retry" size="sm" variant="danger" onClick={() => setEvent('Retry clicked')} />
                                <Button label="Contact support" size="sm" layout="outlined" onClick={() => setEvent('Support clicked')} />
                            </>
                        }
                    />
                    <Alert
                        type="success"
                        variant="soft"
                        title="Pro plan includes"
                        headingLevel={4}
                        description="Everything in Starter, plus:"
                        defaultExpanded
                        detailsLabel="Show features"
                        hideDetailsLabel="Hide features"
                        details={
                            <ul style={{ margin: 0, paddingInlineStart: '1.25rem', lineHeight: 1.7 }}>
                                <li>Unlimited projects and collaborators</li>
                                <li>Priority support with a 4-hour response time</li>
                                <li>Audit logs and SSO</li>
                            </ul>
                        }
                    />
                    <Alert type="info" variant="top-accent" title="Two-factor authentication" elevated>
                        <span>
                            Protect your account by enabling two-factor authentication in <strong>Settings → Security</strong>. It only takes a minute.
                        </span>
                    </Alert>
                    <div style={readoutStyle} aria-live="polite">
                        {event ?? 'Click an alert action.'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Actions;
