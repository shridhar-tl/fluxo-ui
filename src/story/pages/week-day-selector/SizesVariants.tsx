import React from 'react';
import { WeekDaySelector } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<WeekDaySelector size="sm" variant="primary" defaultValue={3} />
<WeekDaySelector size="md" variant="success" defaultValue={3} />
<WeekDaySelector size="lg" variant="danger" defaultValue={3} />`;

const SizesVariants: React.FC = () => (
    <>
        <ComponentDemo title="Sizes & Color Variants" description="Three sizes and four color variants.">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>sm / primary</div>
                    <WeekDaySelector size="sm" variant="primary" defaultValue={3} />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>md / success</div>
                    <WeekDaySelector size="md" variant="success" defaultValue={3} />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>lg / danger</div>
                    <WeekDaySelector size="lg" variant="danger" defaultValue={3} />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>default (neutral)</div>
                    <WeekDaySelector variant="default" defaultValue={3} />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>firstDayOfWeek = 1 (Monday start), disabled weekend</div>
                    <WeekDaySelector firstDayOfWeek={1} disabledDays={[0, 6]} multiple defaultValue={[1, 2, 3, 4, 5]} />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default SizesVariants;
