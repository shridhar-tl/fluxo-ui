import React, { useState } from 'react';

import { addDays, addMonths } from 'date-fns';

import { DatePicker, FieldLabel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { blockedDates, today } from './date-picker-story-data';

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const maxBooking = addMonths(today, 3);
const isOddDay = (date: Date) => date.getDate() % 2 === 1;

const code = `<DatePicker minDate={new Date()} maxDate={addMonths(new Date(), 3)} />
<DatePicker disabledDaysOfWeek={[0, 6]} />
<DatePicker disabledDates={[holiday1, holiday2]} />
<DatePicker disabledDates={(date) => date.getDate() % 2 === 1} />`;

const Constraints: React.FC = () => {
    const [booking, setBooking] = useState<Date | null>(addDays(today, 1));
    const [workday, setWorkday] = useState<Date | null>(null);
    const [blocked, setBlocked] = useState<Date | null>(null);
    const [even, setEven] = useState<Date | null>(null);

    return (
        <>
            <ComponentDemo title="Date Constraints" description="Disabled dates are skipped by keyboard navigation and rejected when typed.">
                <div style={gridStyle}>
                    <FieldLabel label="Next 3 months only" htmlFor="dp-range">
                        <DatePicker id="dp-range" value={booking} onChange={setBooking} minDate={today} maxDate={maxBooking} fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Weekdays only" htmlFor="dp-weekdays">
                        <DatePicker id="dp-weekdays" value={workday} onChange={setWorkday} disabledDaysOfWeek={[0, 6]} placeholder="Mon – Fri" fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Specific dates blocked" htmlFor="dp-blocked">
                        <DatePicker id="dp-blocked" value={blocked} onChange={setBlocked} disabledDates={blockedDates} fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Even days only" htmlFor="dp-even">
                        <DatePicker id="dp-even" value={even} onChange={setEven} disabledDates={isOddDay} fullWidth />
                    </FieldLabel>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Constraints;
