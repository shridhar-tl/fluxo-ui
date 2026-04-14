import React from 'react';
import { WeekDaySelector } from '../../../components';
import type { WeekDayFill, WeekDayVariant } from '../../../components/week-day-selector';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<WeekDaySelector fill="solid"    variant="primary" multiple defaultValue={[1, 3, 5]} />
<WeekDaySelector fill="outlined" variant="primary" multiple defaultValue={[1, 3, 5]} />
<WeekDaySelector fill="subtle"   variant="primary" multiple defaultValue={[1, 3, 5]} />`;

const fills: WeekDayFill[] = ['solid', 'outlined', 'subtle'];
const variants: WeekDayVariant[] = ['default', 'primary', 'success', 'danger'];

const Fills: React.FC = () => (
    <>
        <ComponentDemo title="Fill Styles" description="Solid (filled background), outlined (border-only), or subtle (tinted background).">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
                {fills.map((fill) => (
                    <div key={fill}>
                        <div style={{ fontSize: 12, marginBottom: 8, color: 'var(--eui-text-muted)', textTransform: 'capitalize' }}>{fill}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {variants.map((v) => (
                                <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 60, fontSize: 12, color: 'var(--eui-text-muted)', textTransform: 'capitalize' }}>{v}</div>
                                    <WeekDaySelector fill={fill} variant={v} multiple defaultValue={[1, 3, 5]} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Fills;
