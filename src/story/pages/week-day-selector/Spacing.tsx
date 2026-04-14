import React from 'react';
import { WeekDaySelector } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<WeekDaySelector spacing="spaced" multiple defaultValue={[1, 3]} />
<WeekDaySelector spacing="joined" multiple defaultValue={[1, 3]} />`;

const Spacing: React.FC = () => (
    <>
        <ComponentDemo title="Spacing" description="Spaced or joined (segmented) layouts.">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Spaced</div>
                    <WeekDaySelector spacing="spaced" multiple defaultValue={[1, 3]} />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Joined (no gap, shared borders)</div>
                    <WeekDaySelector spacing="joined" multiple defaultValue={[1, 3]} />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Joined + squared</div>
                    <WeekDaySelector spacing="joined" shape="squared" multiple defaultValue={[2, 4, 6]} />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Spacing;
