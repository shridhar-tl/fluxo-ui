import React, { useState } from 'react';
import { Picker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Picker } from 'fluxo-ui';

const [value, setValue] = useState(['medium']);

<Picker
    columns={[{
        key: 'size',
        label: 'T-shirt size',
        options: [
            { value: 'xs', label: 'XS' },
            { value: 's', label: 'S' },
            { value: 'medium', label: 'M' },
            { value: 'l', label: 'L' },
            { value: 'xl', label: 'XL' },
        ],
    }]}
    value={value}
    onChange={setValue}
/>`;

const options = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => ({ value: s.toLowerCase(), label: s }));

const noteBox: React.CSSProperties = {
    padding: '10px 14px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--eui-text-muted)',
};

const BasicUsage: React.FC = () => {
    const [value, setValue] = useState<string[]>(['m']);
    return (
        <>
            <ComponentDemo title="Single-column picker" description="Scroll the wheel to settle on a value. Outer rows fade and shrink for the classic iOS feel.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 240 }}>
                    <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 8, padding: '8px 0' }}>
                        <Picker columns={[{ key: 'size', label: 'Size', options }]} value={value} onChange={setValue} />
                    </div>
                    <div style={noteBox}>Selected: <strong style={{ color: 'var(--eui-text)' }}>{value.join(', ')}</strong></div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default BasicUsage;
