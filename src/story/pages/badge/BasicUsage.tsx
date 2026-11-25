import React from 'react';

import { AnnouncementIcon, SendIcon, SettingsIcon } from '../../../assets/icons';
import { Avatar, Badge, Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Badge } from 'fluxo-ui';

<Badge count={5} ariaLabel="5 unread notifications">
    <Button leftIcon={AnnouncementIcon} layout="outlined" ariaLabel="Notifications" />
</Badge>

<Badge dot color="success" overlap="circular" ariaLabel="Online">
    <Avatar name="Ava Chen" />
</Badge>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Anchored Badges" description="Wrap any element to attach a count, dot or icon to its corner.">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem' }}>
                <Badge count={5} ariaLabel="5 unread notifications">
                    <Button leftIcon={AnnouncementIcon} layout="outlined" ariaLabel="Notifications" />
                </Badge>
                <Badge count={128} color="primary" ariaLabel="More than 99 messages">
                    <Button leftIcon={SendIcon} layout="outlined" ariaLabel="Messages" />
                </Badge>
                <Badge dot color="warning" ariaLabel="Updates available">
                    <Button leftIcon={SettingsIcon} layout="outlined" ariaLabel="Settings" />
                </Badge>
                <Badge dot color="success" overlap="circular" ariaLabel="Online">
                    <Avatar name="Ava Chen" />
                </Badge>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
