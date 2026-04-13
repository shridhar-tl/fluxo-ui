import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const PresetDates: React.FC = () => {
    const [presetRange, setPresetRange] = useState<[Date, Date]>([new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);

    return (
        <ComponentDemo title="With Preset Dates" description="Date range picker with preset values">
            <div className="w-full max-w-80">
                <DateRangePicker
                    value={presetRange}
                    placeholder="Modify date range..."
                    onChange={(selection) => setPresetRange(selection.value)}
                />
            </div>
        </ComponentDemo>
    );
};

export default PresetDates;
