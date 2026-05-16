import React, { useState } from 'react';
import { SelectButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
];

const code = `// Segmented (iOS-style pill)
<SelectButton variant="segmented" items={items} value={value} onChange={(e) => setValue(e.value)} />

// Pill (rounded with gap)
<SelectButton variant="pill" items={items} value={value} onChange={(e) => setValue(e.value)} />

// Underline (tabs-style)
<SelectButton variant="underline" items={items} value={value} onChange={(e) => setValue(e.value)} />`;

const Variants: React.FC = () => {
    const [seg, setSeg] = useState('week');
    const [pill, setPill] = useState('week');
    const [und, setUnd] = useState('week');
    const [full, setFull] = useState('week');

    return (
        <>
            <ComponentDemo title="Segmented (default new variant)" description="Pill-shaped segmented control — perfect for mobile range/scope toggles.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SelectButton variant="segmented" items={items} value={seg} onChange={(e) => setSeg(e.value as string)} />
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 12,
                            color: 'var(--eui-text-muted)',
                        }}
                    >
                        Selected: <strong style={{ color: 'var(--eui-text)' }}>{seg}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>

            <ComponentDemo title="Pill variant" description="Rounded chips with gaps — wraps onto multiple rows when space is tight." className="mt-4">
                <div style={{ width: '100%' }}>
                    <SelectButton variant="pill" items={items} value={pill} onChange={(e) => setPill(e.value as string)} />
                </div>
            </ComponentDemo>

            <ComponentDemo title="Underline (tabs-style)" description="Used as a horizontal section selector — minimal chrome, single accent line." className="mt-4">
                <div style={{ width: '100%' }}>
                    <SelectButton variant="underline" items={items} value={und} onChange={(e) => setUnd(e.value as string)} />
                </div>
            </ComponentDemo>

            <ComponentDemo title="Full-width segmented" description="Stretch the group to fill the available width — items split evenly." className="mt-4">
                <div style={{ width: '100%', maxWidth: 380 }}>
                    <SelectButton fullWidth variant="segmented" items={items} value={full} onChange={(e) => setFull(e.value as string)} />
                </div>
            </ComponentDemo>
        </>
    );
};

export default Variants;
