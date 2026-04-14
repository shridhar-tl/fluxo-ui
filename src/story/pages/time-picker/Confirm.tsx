import React, { useState } from 'react';
import { TimePicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TimePicker defaultValue="12:00" showConfirm autoClose={false} />

<TimePicker defaultValue="12:00" showNow showConfirm />

<TimePicker variant="inline" defaultValue="12:00" format12 />`;

const Confirm: React.FC = () => {
    const [val, setVal] = useState<Date | null>(null);

    return (
        <>
            <ComponentDemo
                title="Confirm & Inline"
                description="Require explicit confirmation before committing, or render the panel inline without a trigger."
            >
                <div className="space-y-6">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Confirm button (no auto-close)</div>
                        <TimePicker defaultValue="12:00" showConfirm autoClose={false} />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Now + Confirm (returns Date)</div>
                        <TimePicker
                            valueType="date"
                            value={val}
                            onChange={(v) => setVal(v as Date | null)}
                            showNow
                            showConfirm
                            autoClose={false}
                        />
                        <div className="text-xs mt-1 opacity-60">Value: {val ? val.toLocaleTimeString() : '—'}</div>
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Inline variant</div>
                        <TimePicker variant="inline" defaultValue="12:00" format12 />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Confirm;
