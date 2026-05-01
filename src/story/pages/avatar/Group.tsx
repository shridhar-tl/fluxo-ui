import React, { useState } from 'react';
import { Avatar, AvatarGroup } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const [selected, setSelected] = useState(null);

<AvatarGroup
  max={4}
  onAvatarClick={(item, index) => setSelected({ ...item, index })}
>
  <Avatar name="Jane Doe" status="online" />
  <Avatar name="Marcus Lopez" status="busy" />
  <Avatar name="Anna Kim" status="away" />
  <Avatar name="Olivia Park" status="offline" />
  <Avatar name="Diego Reyes" />
  <Avatar name="Hugo Liu" />
</AvatarGroup>`;

const peopleItems = [
    { name: 'Jane Doe', status: 'online' as const },
    { name: 'Marcus Lopez', status: 'busy' as const },
    { name: 'Anna Kim', status: 'away' as const },
    { name: 'Olivia Park', status: 'offline' as const },
    { name: 'Diego Reyes' },
    { name: 'Hugo Liu' },
    { name: 'Sara Toth' },
];

interface SelectedAvatar {
    name?: string;
    status?: string;
    index: number;
}

const Group: React.FC = () => {
    const [selected, setSelected] = useState<SelectedAvatar | null>(null);

    return (
        <>
            <ComponentDemo
                title="Avatar Group"
                description="Stack avatars with overflow and an optional popover listing the hidden ones (click +N). Hover any avatar to bring it to the front, click to fire the per-avatar callback."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <AvatarGroup
                        max={4}
                        ariaLabel="Project members"
                        onAvatarClick={(item, index) => setSelected({ name: item.name, status: item.status, index })}
                    >
                        {peopleItems.map((p) => (
                            <Avatar key={p.name} name={p.name} status={p.status} />
                        ))}
                    </AvatarGroup>

                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            color: 'var(--eui-text)',
                            minWidth: 260,
                            textAlign: 'center',
                            fontSize: 13,
                        }}
                    >
                        {selected
                            ? (
                                <>
                                    Selected: <strong>{selected.name}</strong>
                                    {selected.status && <> &middot; {selected.status}</>}
                                    {' '}(index {selected.index})
                                </>
                            )
                            : 'Click an avatar (or one inside the +N popover) to see the callback fire.'}
                    </div>

                    <AvatarGroup max={3} shape="rounded" overlap={12}>
                        <Avatar name="Jane Doe" status="online" />
                        <Avatar name="Marcus Lopez" status="busy" />
                        <Avatar name="Anna Kim" status="away" />
                        <Avatar name="Olivia Park" status="offline" />
                        <Avatar name="Diego Reyes" />
                    </AvatarGroup>

                    <AvatarGroup direction="rtl" max={5} size="sm">
                        {peopleItems.map((p) => (
                            <Avatar key={p.name} name={p.name} />
                        ))}
                    </AvatarGroup>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Group;
