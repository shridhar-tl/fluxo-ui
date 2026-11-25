import React from 'react';

import { CheckIcon, StarFilledIcon, WarningIcon } from '../../../assets/icons';
import { Avatar, Badge } from '../../../components';
import type { BadgeShape, BadgeSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { badgeVariants, toneList } from './badge-story-data';

const sizes: BadgeSize[] = ['sm', 'md', 'lg'];
const shapes: BadgeShape[] = ['pill', 'rounded', 'square'];

const code = `<Badge count={8} variant="soft" color="success" />
<Badge count={8} variant="outline" color="primary" size="lg" shape="rounded" />
<Badge icon={CheckIcon} color="success" overlap="circular">
    <Avatar name="Ava Chen" />
</Badge>
<Badge content="PRO" color="#7c3aed" />
<Badge content="GOLD" color="#facc15" textColor="#422006" />
<Badge count={3} bordered={false} badgeClassName="shadow-lg">
    <Avatar name="Mia Lopez" />
</Badge>`;

const VariantsColors: React.FC = () => (
    <>
        <ComponentDemo title="Variants, Colors, Sizes & Icons" description="Three variants, every semantic color, custom colors, three sizes and icon badges.">
            <div style={stackStyle}>
                {badgeVariants.map((variant) => (
                    <div key={variant} style={rowStyle}>
                        <span style={rowLabelStyle}>{variant}</span>
                        {toneList.map((tone, index) => (
                            <Badge key={tone} count={index + 3} variant={variant} color={tone} ariaLabel={`${tone} badge`} />
                        ))}
                    </div>
                ))}
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>Sizes</span>
                    {sizes.map((size) => (
                        <Badge key={size} count={42} size={size} color="primary" />
                    ))}
                    {shapes.map((shape) => (
                        <Badge key={shape} content={shape} shape={shape} color="info" variant="soft" />
                    ))}
                </div>
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>Custom</span>
                    <Badge content="PRO" color="#7c3aed" />
                    <Badge content="BETA" color="#facc15" />
                    <Badge content="HOT" color="#ea580c" variant="soft" />
                    <Badge content="LIVE" color="#db2777" variant="outline" />
                    <Badge content="GOLD" color="#facc15" textColor="#422006" />
                    <Badge content="MINT" color="#a7f3d0" textColor="#064e3b" />
                </div>
                <div style={{ ...rowStyle, gap: '2rem' }}>
                    <span style={rowLabelStyle}>Ring</span>
                    <Badge count={3} color="danger" ariaLabel="3 messages, with ring">
                        <Avatar name="Mia Lopez" size="lg" />
                    </Badge>
                    <Badge count={3} color="danger" bordered={false} ariaLabel="3 messages, without ring">
                        <Avatar name="Mia Lopez" size="lg" />
                    </Badge>
                    <Badge count={12} color="primary" badgeClassName="shadow-lg" ariaLabel="12 updates">
                        <Avatar name="Ethan Ross" size="lg" />
                    </Badge>
                </div>
                <div style={{ ...rowStyle, gap: '2rem' }}>
                    <span style={rowLabelStyle}>Icons</span>
                    <Badge icon={CheckIcon} color="success" overlap="circular" placement="bottom-right" ariaLabel="Verified">
                        <Avatar name="Ava Chen" size="lg" />
                    </Badge>
                    <Badge icon={StarFilledIcon} color="warning" overlap="circular" ariaLabel="Top contributor">
                        <Avatar name="Liam Patel" size="lg" />
                    </Badge>
                    <Badge icon={WarningIcon} color="danger" ariaLabel="Action required">
                        <Avatar name="Noah Kim" shape="rounded" size="lg" />
                    </Badge>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default VariantsColors;
