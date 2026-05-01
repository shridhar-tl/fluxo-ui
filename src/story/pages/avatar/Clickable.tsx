import React, { useState } from 'react';
import { Avatar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Avatar name="Jane" onClick={() => setSelected('Jane')} />`;

const people = ['Jane Doe', 'Marcus Lopez', 'Anna Kim', 'Olivia Park'];

const Clickable: React.FC = () => {
    const [selected, setSelected] = useState<string | null>(null);
    return (
        <>
            <ComponentDemo title="Clickable Avatar" description="When onClick is provided the avatar renders as a focusable button.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {people.map((p) => (
                            <Avatar key={p} name={p} onClick={() => setSelected(p)} status="online" />
                        ))}
                    </div>
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                            minWidth: 240,
                            textAlign: 'center',
                        }}
                    >
                        Selected: <strong>{selected ?? '—'}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Clickable;
