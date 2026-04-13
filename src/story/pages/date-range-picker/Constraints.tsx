import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const Constraints: React.FC = () => {
    const [presetRange, setPresetRange] = useState<[Date, Date]>([new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);

    return (
        <ComponentDemo title="With Constraints" description="Limited to future dates only">
            <div className="w-full max-w-80">
                <DateRangePicker
                    value={presetRange}
                    minDate={new Date()}
                    onChange={(selection) => setPresetRange(selection.value)}
                />
            </div>
        </ComponentDemo>
    );
};

export default Constraints;
