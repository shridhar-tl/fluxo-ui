import React, { useState } from 'react';

import { DatePicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowLabelStyle } from '../../demo-styles';
import { today } from './date-picker-story-data';

const columnStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' };

const code = `<DatePicker variant="inline" value={date} onChange={setDate} showWeekNumbers fixedWeeks />
<DatePicker variant="inline" numberOfMonths={2} showOutsideDays={false} />`;

const InlineCalendars: React.FC = () => {
    const [date, setDate] = useState<Date | null>(today);
    const [trip, setTrip] = useState<Date | null>(null);

    return (
        <>
            <ComponentDemo title="Inline & Multi-month" description="Embed the calendar directly in the page. Two months side by side stack vertically on narrow screens.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={columnStyle}>
                            <span style={rowLabelStyle}>Week numbers & fixed weeks</span>
                            <DatePicker variant="inline" value={date} onChange={setDate} showWeekNumbers fixedWeeks showTodayButton ariaLabel="Pick a date" />
                        </div>
                        <div style={columnStyle}>
                            <span style={rowLabelStyle}>Two months</span>
                            <DatePicker variant="inline" numberOfMonths={2} showOutsideDays={false} value={trip} onChange={setTrip} minDate={today} ariaLabel="Pick a travel date" />
                        </div>
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        {date ? date.toDateString() : 'No date'} · Trip: {trip ? trip.toDateString() : 'not set'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default InlineCalendars;
