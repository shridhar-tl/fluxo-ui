import React, { useMemo, useState } from 'react';
import { Picker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Picker
    columns={[
        { key: 'hour', label: 'Hour', options: hours },
        { key: 'min', label: 'Min', options: minutes },
        { key: 'ampm', label: '', options: [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }] },
    ]}
    value={time}
    onChange={setTime}
/>`;

const noteBox: React.CSSProperties = {
    padding: '10px 14px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--eui-text-muted)',
};

const MultiColumn: React.FC = () => {
    const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1).padStart(2, '0') })), []);
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ value: String(i), label: String(i).padStart(2, '0') })), []);
    const [time, setTime] = useState<string[]>(['9', '30', 'AM']);

    return (
        <>
            <ComponentDemo title="Time picker (3 columns)" description="Use multiple columns for compound values like time, date, or units. Each column scrolls independently.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
                    <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 8, padding: '8px 0' }}>
                        <Picker
                            columns={[
                                { key: 'hour', label: 'Hour', options: hours },
                                { key: 'min', label: 'Min', options: minutes },
                                { key: 'ampm', options: [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }] },
                            ]}
                            value={time}
                            onChange={setTime}
                        />
                    </div>
                    <div style={noteBox}>Selected: <strong style={{ color: 'var(--eui-text)' }}>{time[0]}:{time[1].padStart(2, '0')} {time[2]}</strong></div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default MultiColumn;
