import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import type { DateRangeValue } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';

const singleDateCode = `<DateRangePicker
  range={false}
  placeholder="Pick a date..."
  onChange={(sel) => {
    // sel.value is [Date, Date] where both are the same
    const selectedDate = sel.value[0];
    console.log(selectedDate);
  }}
/>`;

const SingleDatePicker: React.FC = () => {
    const [value, setValue] = useState<DateRangeValue | null>(null);

    return (
        <>
            <ComponentDemo title="Single Date Selection" description="Set range={false} to select a single date instead of a range. The picker closes immediately on selection.">
                <div className="space-y-4">
                    <div className="w-full max-w-80">
                        <DateRangePicker
                            value={value || undefined}
                            range={false}
                            placeholder="Pick a date..."
                            onChange={(sel) => setValue(sel.value)}
                        />
                    </div>
                    {value && (
                        <p className="text-xs text-gray-400">
                            Selected: {value[0].toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={singleDateCode} title="Single Date" />
            </div>
        </>
    );
};

export default SingleDatePicker;
