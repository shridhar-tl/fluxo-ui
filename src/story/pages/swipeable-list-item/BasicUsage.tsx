import React, { useState } from 'react';
import { SwipeableListItem } from '../../../components';
import { TrashIcon, ArchivedIcon, StarIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { SwipeableListItem } from 'fluxo-ui';

<SwipeableListItem
    rightActions={[
        { label: 'Archive', icon: <ArchivedIcon />, color: 'warning', onTrigger: archive },
        { label: 'Delete', icon: <TrashIcon />, color: 'danger', onTrigger: remove },
    ]}
    leftActions={[
        { label: 'Star', icon: <StarIcon />, color: 'primary', onTrigger: star },
    ]}
>
    <div>Subject line — preview text…</div>
</SwipeableListItem>`;

interface Row { id: number; subject: string; preview: string; }

const initial: Row[] = [
    { id: 1, subject: 'Build status', preview: 'main is green — all checks passed.' },
    { id: 2, subject: 'Welcome aboard', preview: 'Onboarding kit attached.' },
    { id: 3, subject: 'Standup notes', preview: 'Three items for tomorrow.' },
    { id: 4, subject: 'New comment', preview: '@alex replied to your card.' },
];

const noteBox: React.CSSProperties = {
    padding: '10px 14px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--eui-text-muted)',
};

const BasicUsage: React.FC = () => {
    const [rows, setRows] = useState<Row[]>(initial);
    const [last, setLast] = useState<string | null>(null);

    const remove = (id: number) => {
        setRows((r) => r.filter((row) => row.id !== id));
        setLast(`Deleted #${id}`);
    };
    const archive = (id: number) => {
        setRows((r) => r.filter((row) => row.id !== id));
        setLast(`Archived #${id}`);
    };
    const star = (id: number) => setLast(`Starred #${id}`);

    return (
        <>
            <ComponentDemo title="Swipe to reveal actions" description="Drag a row left to reveal Archive + Delete, drag right to reveal Star. Tap a revealed action to trigger it.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 480,
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: 'var(--eui-bg)',
                    }}>
                        {rows.length === 0 && (
                            <div style={{ padding: 24, textAlign: 'center', color: 'var(--eui-text-muted)' }}>
                                Inbox cleared. Reload the page to reset.
                            </div>
                        )}
                        {rows.map((row, idx) => (
                            <SwipeableListItem
                                key={row.id}
                                leftActions={[
                                    { label: 'Star', icon: <StarIcon />, color: 'primary', onTrigger: () => star(row.id) },
                                ]}
                                rightActions={[
                                    { label: 'Archive', icon: <ArchivedIcon />, color: 'warning', onTrigger: () => archive(row.id) },
                                    { label: 'Delete', icon: <TrashIcon />, color: 'danger', onTrigger: () => remove(row.id), fullSwipe: true },
                                ]}
                                className={idx > 0 ? 'eui-divided-row' : undefined}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--eui-text)' }}>{row.subject}</div>
                                    <div style={{ fontSize: 13, color: 'var(--eui-text-muted)', marginTop: 2 }}>{row.preview}</div>
                                </div>
                            </SwipeableListItem>
                        ))}
                    </div>
                    <div style={noteBox}>Last action: <strong style={{ color: 'var(--eui-text)' }}>{last ?? '—'}</strong></div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default BasicUsage;
