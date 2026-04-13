import React, { useState } from 'react';
import { DateRangePicker, Dropdown } from '../../../components';
import type { DateRangeValue } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';

const firstDayCode = `<DateRangePicker
  firstDayOfWeek={1} // Monday
  onChange={(sel) => console.log(sel.value)}
/>`;

const dayOptions = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Saturday', value: 6 },
];

const FirstDayOfWeek: React.FC = () => {
    const [range, setRange] = useState<DateRangeValue | null>(null);
    const [firstDay, setFirstDay] = useState(0);

    return (
        <>
            <ComponentDemo title="First Day of Week" description="Configure which day the calendar week starts on." centered={false}>
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start day</label>
                        <Dropdown
                            value={firstDay}
                            options={dayOptions}
                            onChange={(e) => setFirstDay(e.value)}
                            size="sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Week Picker</label>
                        <div className="w-full max-w-80">
                            <DateRangePicker
                                value={range || undefined}
                                placeholder="Select a week..."
                                selectionMode="week"
                                firstDayOfWeek={firstDay}
                                onChange={(sel) => setRange(sel.value)}
                            />
                        </div>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={firstDayCode} title="First Day of Week" />
            </div>
        </>
    );
};

export default FirstDayOfWeek;
