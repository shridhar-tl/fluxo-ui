import React, { useState } from 'react';
import { PinInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { PinInput } from 'fluxo-ui';

const [code, setCode] = useState('');

<PinInput
    length={6}
    value={code}
    onChange={setCode}
    onComplete={(v) => verify(v)}
    autoFocus
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
    const [value, setValue] = useState('');
    const [complete, setComplete] = useState<string | null>(null);
    return (
        <>
            <ComponentDemo title="6-digit code" description="Auto-advances to the next field as the user types. Paste a full code into any field to fill all six.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <PinInput length={6} value={value} onChange={(v) => { setValue(v); setComplete(null); }} onComplete={setComplete} autoFocus />
                    <div style={noteBox}>Value: <strong style={{ color: 'var(--eui-text)' }}>{value || '—'}</strong>{complete && <> · onComplete fired with <strong style={{ color: 'var(--eui-text)' }}>{complete}</strong></>}</div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default BasicUsage;
