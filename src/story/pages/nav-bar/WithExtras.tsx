import React, { useState } from 'react';
import { NavBar, SelectButton, TextInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<NavBar
    title="Library"
    onBack={goBack}
>
    <SelectButton variant="segmented" items={...} value={view} onChange={...} />
</NavBar>`;

const frame: React.CSSProperties = {
    width: '100%',
    maxWidth: 380,
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 12,
    overflow: 'hidden',
    background: 'var(--eui-bg-subtle)',
};

const WithExtras: React.FC = () => {
    const [view, setView] = useState<string>('all');
    const [q, setQ] = useState('');
    return (
        <>
            <ComponentDemo title="With segmented sub-row" description="Pass children to render an extra row below the toolbar — handy for segmented filters or tabs.">
                <div style={frame}>
                    <NavBar title="Library" onBack={() => undefined}>
                        <SelectButton
                            variant="segmented"
                            fullWidth
                            items={[
                                { value: 'all', label: 'All' },
                                { value: 'pinned', label: 'Pinned' },
                                { value: 'recent', label: 'Recent' },
                            ]}
                            value={view}
                            onChange={(e) => setView(e.value as string)}
                        />
                    </NavBar>
                    <div style={{ padding: 16, minHeight: 80, color: 'var(--eui-text-muted)' }}>Showing: <strong style={{ color: 'var(--eui-text)' }}>{view}</strong></div>
                </div>
            </ComponentDemo>

            <ComponentDemo title="With search sub-row" description="Place a TextInput in children for an inline search experience." className="mt-4">
                <div style={frame}>
                    <NavBar title="Search">
                        <TextInput value={q} onChange={(e) => setQ(e.value)} placeholder="Search messages…" />
                    </NavBar>
                    <div style={{ padding: 16, minHeight: 80, color: 'var(--eui-text-muted)' }}>Query: <strong style={{ color: 'var(--eui-text)' }}>{q || '—'}</strong></div>
                </div>
            </ComponentDemo>

            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default WithExtras;
