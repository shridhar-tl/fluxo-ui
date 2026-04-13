import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const BasicUsage: React.FC = () => {
    const [basicRange, setBasicRange] = useState<[Date, Date] | null>(null);

    return (
        <ComponentDemo title="Basic Date Range Picker" description="Simple date range selection">
            <div className="w-full max-w-80">
                <DateRangePicker
                    value={basicRange || undefined}
                    placeholder="Select date range..."
                    onChange={(selection) => setBasicRange(selection.value)}
                />
            </div>
        </ComponentDemo>
    );
};

export default BasicUsage;
