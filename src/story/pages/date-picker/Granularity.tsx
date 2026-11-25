import React, { useState } from 'react';

import { DatePicker, FieldLabel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { today } from './date-picker-story-data';

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const code = `<DatePicker granularity="month" format="MMMM yyyy" />
<DatePicker granularity="year" format="yyyy" yearRange={[1950, 2030]} />`;

const Granularity: React.FC = () => {
    const [month, setMonth] = useState<Date | null>(today);
    const [year, setYear] = useState<Date | null>(null);
    const [birthday, setBirthday] = useState<Date | null>(null);

    return (
        <>
            <ComponentDemo
                title="Month & Year Pickers"
                description="Pick a whole month or year. In day mode, click the header to jump to month and year views."
            >
                <div style={gridStyle}>
                    <FieldLabel label="Billing month" htmlFor="dp-month">
                        <DatePicker id="dp-month" granularity="month" format="MMMM yyyy" value={month} onChange={setMonth} fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Graduation year" htmlFor="dp-year">
                        <DatePicker id="dp-year" granularity="year" format="yyyy" yearRange={[1950, 2030]} value={year} onChange={setYear} placeholder="Select a year" fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Date of birth" htmlFor="dp-birthday">
                        <DatePicker
                            id="dp-birthday"
                            value={birthday}
                            onChange={setBirthday}
                            maxDate={today}
                            yearRange={[1920, today.getFullYear()]}
                            format="dd/MM/yyyy"
                            placeholder="dd/mm/yyyy"
                            fullWidth
                        />
                    </FieldLabel>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Granularity;
