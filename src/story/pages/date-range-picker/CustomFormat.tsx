import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const CustomFormat: React.FC = () => {
    const [presetRange, setPresetRange] = useState<[Date, Date]>([new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);

    return (
        <ComponentDemo title="Custom Format" description="Custom date format and separator">
            <div className="w-full max-w-80">
                <DateRangePicker
                    value={presetRange}
                    dateFormat="yyyy-MM-dd"
                    separator=" to "
                    onChange={(selection) => setPresetRange(selection.value)}
                />
            </div>
        </ComponentDemo>
    );
};

export default CustomFormat;
