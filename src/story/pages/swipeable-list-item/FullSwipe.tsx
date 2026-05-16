import React, { useState } from 'react';
import { SwipeableListItem } from '../../../components';
import { TrashIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<SwipeableListItem
    rightActions={[
        { label: 'Delete', icon: <TrashIcon />, color: 'danger', fullSwipe: true, onTrigger: remove },
    ]}
    fullSwipeThreshold={0.7}
>
    {/* row content */}
</SwipeableListItem>`;

const FullSwipe: React.FC = () => {
    const [rows, setRows] = useState<number[]>([1, 2, 3, 4, 5]);
    return (
        <>
            <ComponentDemo title="Full-swipe to trigger" description="Set fullSwipe on an action and swipe past 70% — the action fires automatically without a tap.">
                <div style={{ width: '100%', maxWidth: 480, border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                    {rows.map((id) => (
                        <SwipeableListItem
                            key={id}
                            fullSwipeThreshold={0.7}
                            rightActions={[{
                                label: 'Delete',
                                icon: <TrashIcon />,
                                color: 'danger',
                                fullSwipe: true,
                                onTrigger: () => setRows((r) => r.filter((v) => v !== id)),
                            }]}
                        >
                            <div style={{ color: 'var(--eui-text)' }}>Item #{id} — full-swipe left to delete</div>
                        </SwipeableListItem>
                    ))}
                    {rows.length === 0 && (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--eui-text-muted)' }}>All rows cleared — reload to reset.</div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default FullSwipe;
