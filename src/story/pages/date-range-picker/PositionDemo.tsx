import React, { useState } from 'react';
import { DateRangePicker } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const PositionDemo: React.FC = () => {
    const [topRange, setTopRange] = useState<[Date, Date]>([new Date(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)]);

    return (
        <ComponentDemo title="Popover Position — Top" description="Picker opens upward using topStart position">
            <div className="w-full max-w-80 mt-32">
                <DateRangePicker
                    value={topRange}
                    position="topStart"
                    onChange={(selection) => setTopRange(selection.value)}
                />
            </div>
        </ComponentDemo>
    );
};

export default PositionDemo;
