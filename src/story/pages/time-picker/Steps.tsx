import React from 'react';
import { TimePicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TimePicker defaultValue="09:00" minuteStep={15} />

<TimePicker defaultValue="09:00" minuteStep={5} />

<TimePicker defaultValue="09:00:00" showSeconds secondStep={10} />`;

const Steps: React.FC = () => (
    <>
        <ComponentDemo
            title="Step Increments"
            description="Limit the options in each column with hourStep, minuteStep, and secondStep. Great for appointment slots."
        >
            <div className="space-y-6">
                <div>
                    <div className="text-sm mb-2 opacity-70">15-minute slots</div>
                    <TimePicker defaultValue="09:00" minuteStep={15} />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">5-minute slots</div>
                    <TimePicker defaultValue="09:00" minuteStep={5} />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">2-hour slots, 10-second precision</div>
                    <TimePicker defaultValue="08:00:00" hourStep={2} showSeconds secondStep={10} />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Steps;
