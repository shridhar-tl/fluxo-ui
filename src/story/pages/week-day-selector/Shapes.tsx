import React from 'react';
import { WeekDaySelector } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<WeekDaySelector shape="rounded" defaultValue={2} />
<WeekDaySelector shape="squared" defaultValue={2} />
<WeekDaySelector shape="circle" defaultValue={2} />`;

const Shapes: React.FC = () => (
    <>
        <ComponentDemo title="Shapes" description="Rounded pill, squared, or circle.">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Rounded</div>
                    <WeekDaySelector shape="rounded" defaultValue={2} />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Squared</div>
                    <WeekDaySelector shape="squared" defaultValue={2} />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Circle</div>
                    <WeekDaySelector shape="circle" defaultValue={2} />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Shapes;
