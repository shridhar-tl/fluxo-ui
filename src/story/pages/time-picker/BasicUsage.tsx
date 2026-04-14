import React, { useState } from 'react';
import { TimePicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { TimePicker } from 'fluxo-ui';

const [time, setTime] = useState<string | null>('09:30');

<TimePicker value={time} onChange={(v) => setTime(v as string | null)} />

<TimePicker defaultValue="14:45" />

<TimePicker placeholder="Meeting time" />`;

const BasicUsage: React.FC = () => {
    const [time, setTime] = useState<string | null>('09:30');

    return (
        <>
            <ComponentDemo title="Default Time Picker" description="24-hour format by default. Type directly or pick from the dropdown.">
                <div className="space-y-6">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Controlled ({time ?? 'empty'})</div>
                        <TimePicker value={time} onChange={(v) => setTime(v as string | null)} />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Uncontrolled</div>
                        <TimePicker defaultValue="14:45" />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Empty with placeholder</div>
                        <TimePicker placeholder="Meeting time" />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Disabled</div>
                        <TimePicker defaultValue="10:00" disabled />
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
