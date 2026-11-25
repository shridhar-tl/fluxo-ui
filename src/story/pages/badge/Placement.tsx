import React, { useState } from 'react';

import { Avatar, Badge, SelectButton } from '../../../components';
import type { BadgeOverlap } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { placements } from './badge-story-data';

const overlapItems = [
    { label: 'Rectangular', value: 'rectangular' },
    { label: 'Circular', value: 'circular' },
];

const code = `<Badge count={4} placement="bottom-left" overlap="circular">
    <Avatar name="Liam Patel" size="lg" />
</Badge>

<Badge count={9} offset={[-6, 6]}>
    <Avatar name="Noah Kim" shape="rounded" size="lg" />
</Badge>`;

const Placement: React.FC = () => {
    const [overlap, setOverlap] = useState<BadgeOverlap>('rectangular');
    const shape = overlap === 'circular' ? 'circle' : 'rounded';

    return (
        <>
            <ComponentDemo
                title="Placement, Overlap & Offset"
                description="Pin the badge to any corner. Circular overlap keeps it on the edge of round anchors; offset fine-tunes the position."
            >
                <div style={stackStyle}>
                    <SelectButton
                        items={overlapItems}
                        value={overlap}
                        onChange={(event) => setOverlap(event.value as BadgeOverlap)}
                        ariaLabel="Overlap"
                    />
                    <div style={{ ...rowStyle, gap: '2.5rem' }}>
                        {placements.map((placement) => (
                            <div key={placement} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                <Badge count={4} placement={placement} overlap={overlap}>
                                    <Avatar name="Liam Patel" shape={shape} size="lg" />
                                </Badge>
                                <span style={rowLabelStyle}>{placement}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ ...rowStyle, gap: '2.5rem' }}>
                        <span style={rowLabelStyle}>Offset</span>
                        <Badge count={9} overlap={overlap}>
                            <Avatar name="Noah Kim" shape={shape} size="lg" />
                        </Badge>
                        <Badge count={9} overlap={overlap} offset={[-6, 6]}>
                            <Avatar name="Noah Kim" shape={shape} size="lg" />
                        </Badge>
                        <Badge count={9} overlap={overlap} offset={[8, -8]}>
                            <Avatar name="Noah Kim" shape={shape} size="lg" />
                        </Badge>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Placement;
