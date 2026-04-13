import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import type { DateRangeValue } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';

const selectionModeCode = `<DateRangePicker
  selectionMode="week"
  range={false}
  firstDayOfWeek={1}
  onChange={(sel) => console.log(sel.value)}
/>

<DateRangePicker
  selectionMode="month"
  range={false}
  onChange={(sel) => console.log(sel.value)}
/>

<DateRangePicker
  selectionMode="year"
  range={false}
  onChange={(sel) => console.log(sel.value)}
/>`;

const SelectionModes: React.FC = () => {
    const [weekRange, setWeekRange] = useState<DateRangeValue | null>(null);
    const [monthRange, setMonthRange] = useState<DateRangeValue | null>(null);
    const [yearRange, setYearRange] = useState<DateRangeValue | null>(null);
    const [dayRange, setDayRange] = useState<DateRangeValue | null>(null);

    const formatRange = (range: DateRangeValue | null) => {
        if (!range) return 'None selected';
        return `${range[0].toLocaleDateString()} – ${range[1].toLocaleDateString()}`;
    };

    return (
        <>
            <ComponentDemo title="Selection Modes" description="Control what unit is selected: day (default), week, month, or year." centered={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Day Mode (default)</label>
                        <div className="w-full max-w-80">
                            <DateRangePicker
                                value={dayRange || undefined}
                                placeholder="Select day range..."
                                onChange={(sel) => setDayRange(sel.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-400">{formatRange(dayRange)}</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Week Mode</label>
                        <div className="w-full max-w-80">
                            <DateRangePicker
                                value={weekRange || undefined}
                                placeholder="Select a week..."
                                selectionMode="week"
                                range={false}
                                onChange={(sel) => setWeekRange(sel.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-400">{formatRange(weekRange)}</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Month Mode</label>
                        <div className="w-full max-w-80">
                            <DateRangePicker
                                value={monthRange || undefined}
                                placeholder="Select a month..."
                                selectionMode="month"
                                range={false}
                                onChange={(sel) => setMonthRange(sel.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-400">{formatRange(monthRange)}</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year Mode</label>
                        <div className="w-full max-w-80">
                            <DateRangePicker
                                value={yearRange || undefined}
                                placeholder="Select a year..."
                                selectionMode="year"
                                range={false}
                                onChange={(sel) => setYearRange(sel.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-400">{formatRange(yearRange)}</p>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={selectionModeCode} title="Selection Modes" />
            </div>
        </>
    );
};

export default SelectionModes;
