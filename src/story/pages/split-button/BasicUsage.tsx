import React, { useState } from 'react';
import { CopyIcon, EditIcon, ShareIcon, TrashIcon } from '../../../assets/icons';
import { SplitButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { SplitButton } from 'fluxo-ui';

<SplitButton
  label="Save"
  onClick={() => console.log('Save')}
  items={[
    { label: 'Save as draft', icon: EditIcon, onClick: () => {} },
    { label: 'Save and publish', icon: ShareIcon, onClick: () => {} },
    { divider: true },
    { label: 'Discard changes', icon: TrashIcon, danger: true, onClick: () => {} },
  ]}
/>`;

const BasicUsage: React.FC = () => {
    const [last, setLast] = useState<string | null>(null);
    return (
        <>
            <ComponentDemo title="Default Split Button" description="Primary action with related actions in a menu.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <SplitButton
                        label="Save"
                        onClick={() => setLast('Save')}
                        items={[
                            { label: 'Save as draft', icon: EditIcon, onClick: () => setLast('Save as draft') },
                            { label: 'Save and publish', icon: ShareIcon, onClick: () => setLast('Save and publish') },
                            { label: 'Duplicate', icon: CopyIcon, shortcut: '⌘D', onClick: () => setLast('Duplicate') },
                            { divider: true },
                            { label: 'Discard changes', icon: TrashIcon, danger: true, onClick: () => setLast('Discard changes') },
                        ]}
                    />
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                            minWidth: 220,
                            textAlign: 'center',
                        }}
                    >
                        Last action: <strong>{last ?? '—'}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
