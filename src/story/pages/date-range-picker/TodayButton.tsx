import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const TodayButton: React.FC = () => {
    const [presetRange, setPresetRange] = useState<[Date, Date]>([new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);

    return (
        <ComponentDemo title="With Today Button" description="Date range picker with today button and custom label">
            <div className="w-full max-w-80">
                <DateRangePicker
                    value={presetRange}
                    showTodayButton={true}
                    customLabel="Select Custom Range"
                    onChange={(selection) => setPresetRange(selection.value)}
                    onClose={() => console.log('Picker closed')}
                />
            </div>
        </ComponentDemo>
    );
};

export default TodayButton;
