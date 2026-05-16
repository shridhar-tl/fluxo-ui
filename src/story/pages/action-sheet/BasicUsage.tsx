import React, { useState } from 'react';
import { ActionSheet, Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { ActionSheet, Button } from 'fluxo-ui';

const [open, setOpen] = useState(false);

<Button label="Share…" onClick={() => setOpen(true)} />
<ActionSheet
    open={open}
    onClose={() => setOpen(false)}
    title="Share photo"
    actions={[
        { label: 'Copy link', onSelect: copyLink },
        { label: 'Save to Files', onSelect: save },
        { label: 'Delete', destructive: true, onSelect: remove },
    ]}
/>`;

const noteBox: React.CSSProperties = {
    padding: '10px 14px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--eui-text-muted)',
};

const BasicUsage: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState<string | null>(null);

    return (
        <>
            <ComponentDemo title="Tap to open" description="Each action runs its onSelect handler and the sheet auto-closes.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <Button label="Open action sheet" onClick={() => setOpen(true)} />
                    </div>
                    <div style={noteBox}>Last action: <strong style={{ color: 'var(--eui-text)' }}>{last ?? '—'}</strong></div>
                </div>
                <ActionSheet
                    open={open}
                    onClose={() => setOpen(false)}
                    title="Share photo"
                    message="Choose what to do with the selected photo."
                    actions={[
                        { label: 'Copy link', onSelect: () => setLast('Copy link') },
                        { label: 'Save to Files', onSelect: () => setLast('Save to Files') },
                        { label: 'Move to album', onSelect: () => setLast('Move to album') },
                        { label: 'Delete', destructive: true, onSelect: () => setLast('Delete') },
                    ]}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
