import React from 'react';
import { TimePicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TimePicker defaultValue="14:30" />

<TimePicker defaultValue="14:30" format12 />

<TimePicker defaultValue="14:30:45" showSeconds />

<TimePicker defaultValue="14:30:45" format12 showSeconds />`;

const Formats: React.FC = () => (
    <>
        <ComponentDemo title="12/24 Hour & Seconds" description="Toggle between 12-hour and 24-hour clocks, and optionally include seconds.">
            <div className="space-y-6">
                <div>
                    <div className="text-sm mb-2 opacity-70">24-hour (default)</div>
                    <TimePicker defaultValue="14:30" />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">12-hour</div>
                    <TimePicker defaultValue="14:30" format12 />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">24-hour with seconds</div>
                    <TimePicker defaultValue="14:30:45" showSeconds />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">12-hour with seconds</div>
                    <TimePicker defaultValue="14:30:45" format12 showSeconds />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Formats;
