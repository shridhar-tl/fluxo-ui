import React from 'react';
import { Avatar, AvatarStatus, AvatarStatusPosition } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Avatar name="A" status="online" />
<Avatar name="B" status="busy" statusPosition="top-right" />
<Avatar name="C" status="away" statusPosition="bottom-left" />
<Avatar name="D" status="offline" statusPosition="top-left" />`;

const positions: AvatarStatusPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const statuses: AvatarStatus[] = ['online', 'offline', 'busy', 'away'];

const Statuses: React.FC = () => (
    <>
        <ComponentDemo title="Statuses & Positions" description="All four statuses across all four positions.">
            <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(4, 1fr)', gap: 12, alignItems: 'center' }}>
                <span></span>
                {statuses.map((s) => (
                    <span key={s} style={{ fontSize: 11, color: 'var(--eui-text-muted)', textAlign: 'center' }}>
                        {s}
                    </span>
                ))}
                {positions.map((pos) => (
                    <React.Fragment key={pos}>
                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>{pos}</span>
                        {statuses.map((status) => (
                            <div key={`${pos}-${status}`} style={{ display: 'flex', justifyContent: 'center' }}>
                                <Avatar size="lg" name="J D" status={status} statusPosition={pos} />
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Statuses;
