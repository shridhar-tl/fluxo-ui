import React from 'react';

import { CheckCircleIcon, ClockIcon, ErrorIcon, StarFilledIcon, UserIcon } from '../../../assets/icons';
import { Avatar, Tag } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { people } from './tag-story-data';

const code = `<Tag color="success" icon={CheckCircleIcon}>Approved</Tag>
<Tag color="warning" icon={ClockIcon} iconPosition="end">Pending</Tag>
<Tag shape="pill" size="lg" avatar={<Avatar name="Ava Chen" size={20} />}>Ava Chen</Tag>
<Tag variant="outline" count={12}>Issues</Tag>`;

const IconsAvatars: React.FC = () => (
    <>
        <ComponentDemo title="Icons, Avatars & Counts" description="Add a leading or trailing icon, an avatar, or a counter pill.">
            <div style={stackStyle}>
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>Icons</span>
                    <Tag color="success" icon={CheckCircleIcon}>
                        Approved
                    </Tag>
                    <Tag color="warning" icon={ClockIcon} iconPosition="end">
                        Pending
                    </Tag>
                    <Tag color="danger" variant="solid" icon={ErrorIcon}>
                        Failed
                    </Tag>
                    <Tag color="primary" variant="outline" shape="pill" icon={StarFilledIcon}>
                        Featured
                    </Tag>
                    <Tag icon={UserIcon} variant="ghost">
                        Owner
                    </Tag>
                </div>
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>Avatars</span>
                    {people.map((name) => (
                        <Tag key={name} shape="pill" size="lg" avatar={<Avatar name={name} size={20} />}>
                            {name}
                        </Tag>
                    ))}
                </div>
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>Counts</span>
                    <Tag variant="outline" count={12}>
                        Issues
                    </Tag>
                    <Tag color="primary" count={3}>
                        Pull requests
                    </Tag>
                    <Tag color="success" variant="solid" count="99+">
                        Stars
                    </Tag>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default IconsAvatars;
