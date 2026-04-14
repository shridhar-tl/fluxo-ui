import React, { useState } from 'react';
import { WeekDaySelector } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { WeekDaySelector } from 'fluxo-ui';

const [day, setDay] = useState<number | null>(1);
<WeekDaySelector value={day} onChange={setDay} />

const [days, setDays] = useState<number[]>([1, 3, 5]);
<WeekDaySelector multiple value={days} onChange={setDays} />`;

const BasicUsage: React.FC = () => {
    const [day, setDay] = useState<number | null>(1);
    const [days, setDays] = useState<number[]>([1, 3, 5]);

    return (
        <>
            <ComponentDemo title="Single & Multiple Selection" description="Single returns a day number, multiple returns an array.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <div style={{ fontSize: 12, marginBottom: 8, color: 'var(--eui-text-muted)' }}>Single (selected: {day ?? 'none'})</div>
                        <WeekDaySelector value={day} onChange={setDay} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, marginBottom: 8, color: 'var(--eui-text-muted)' }}>Multiple (selected: [{days.join(', ')}])</div>
                        <WeekDaySelector multiple value={days} onChange={setDays} />
                    </div>
                    <div style={{ padding: '10px 14px', background: 'var(--eui-bg-subtle)', border: '1px solid var(--eui-border-subtle)', borderRadius: 6, fontSize: 13, color: 'var(--eui-text)' }}>
                        Days are 0-indexed: 0 = Sunday, 6 = Saturday.
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
