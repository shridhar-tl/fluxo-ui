import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { quickRanges, quickSelectCode } from './date-range-picker-story-data';

const QuickSelect: React.FC = () => {
    const [quickSelectRange, setQuickSelectRange] = useState<string>('today');
    const [, setPresetRange] = useState<[Date, Date]>([new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);

    return (
        <>
            <ComponentDemo title="With Quick Select Ranges" description="Date range picker with predefined quick ranges">
                <div className="w-full max-w-80">
                    <DateRangePicker
                        value={quickSelectRange}
                        ranges={quickRanges}
                        onChange={(selection) => {
                            setQuickSelectRange(String(selection.range || 'custom'));
                            if (Array.isArray(selection.value)) {
                                setPresetRange(selection.value);
                            }
                        }}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={quickSelectCode} language="typescript" />
            </div>
        </>
    );
};

export default QuickSelect;
