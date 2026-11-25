import React from 'react';

import { Avatar, Badge, Card } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { statuses, teamMembers } from './badge-story-data';

const statusLabel: Record<string, string> = {
    success: 'Online',
    warning: 'Away',
    error: 'Busy',
    default: 'Offline',
};

const code = `<Badge status="success" text="Operational" />
<Badge status="processing" text="Deploying" />

<Badge dot pulse color="danger" overlap="circular" placement="bottom-right">
    <Avatar name="Noah Kim" />
</Badge>`;

const DotStatus: React.FC = () => (
    <>
        <ComponentDemo title="Dots & Status Indicators" description="Status badges pair a colored dot with text; processing pulses automatically.">
            <div style={stackStyle}>
                <div style={{ ...rowStyle, gap: '1.5rem' }}>
                    <span style={rowLabelStyle}>Status</span>
                    {statuses.map((s) => (
                        <Badge key={s.status} status={s.status} text={s.text} />
                    ))}
                </div>
                <div style={{ ...rowStyle, gap: '1.5rem' }}>
                    <span style={rowLabelStyle}>Presence</span>
                    {teamMembers.map((member) => (
                        <Badge
                            key={member.name}
                            dot
                            pulse={member.status === 'success'}
                            color={member.status === 'error' ? 'danger' : member.status === 'default' ? 'secondary' : member.status}
                            overlap="circular"
                            placement="bottom-right"
                            ariaLabel={`${member.name} is ${statusLabel[member.status]}`}
                        >
                            <Avatar name={member.name} size="lg" />
                        </Badge>
                    ))}
                </div>
                <div style={{ maxWidth: 380, width: '100%' }}>
                    <Card title="Team" subtitle="Unread conversations">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {teamMembers.map((member) => (
                                <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Avatar name={member.name} size="sm" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: 'var(--eui-text)', fontSize: '0.875rem', fontWeight: 600 }}>{member.name}</div>
                                        <Badge
                                            status={member.status}
                                            text={statusLabel[member.status]}
                                            style={{ fontSize: '0.75rem', color: 'var(--eui-text-muted)' }}
                                        />
                                    </div>
                                    <Badge count={member.unread} color="primary" ariaLabel={`${member.unread} unread`} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default DotStatus;
