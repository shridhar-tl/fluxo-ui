import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const DisabledState: React.FC = () => {
    const [presetRange] = useState<[Date, Date]>([new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);

    return (
        <ComponentDemo title="Disabled State" description="DateRangePicker in disabled state">
            <div className="w-full max-w-80">
                <DateRangePicker
                    value={presetRange}
                    disabled
                    onChange={() => {}}
                />
            </div>
        </ComponentDemo>
    );
};

export default DisabledState;
