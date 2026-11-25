import React, { useCallback, useState } from 'react';

import { isSameDay } from 'date-fns';

import { DatePicker, Tag } from '../../../components';
import type { DatePickerDayState } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle } from '../../demo-styles';
import { highlightList, priceByDay, today } from './date-picker-story-data';

const columnStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' };

const renderPriceDay = (date: Date, state: DatePickerDayState) => (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }}>
        <span>{date.getDate()}</span>
        {!state.disabled && !state.outside && (
            <span style={{ fontSize: '0.5625rem', opacity: state.selected ? 0.9 : 0.7 }}>${priceByDay(date)}</span>
        )}
    </span>
);

const code = `<DatePicker
    variant="inline"
    highlightedDates={[
        { date: release, color: 'success', label: 'Release' },
        { date: deadline, color: 'danger', label: 'Deadline' },
    ]}
/>

<DatePicker
    variant="inline"
    minDate={new Date()}
    renderDay={(date, state) => (
        <span>
            {date.getDate()}
            {!state.disabled && <small>\${price(date)}</small>}
        </span>
    )}
/>`;

const CustomDays: React.FC = () => {
    const [eventDate, setEventDate] = useState<Date | null>(highlightList[1].date);
    const [flight, setFlight] = useState<Date | null>(null);

    const selectedEvent = eventDate ? highlightList.find((h) => isSameDay(h.date, eventDate)) : undefined;
    const handleFlight = useCallback((d: Date | null) => setFlight(d), []);

    return (
        <>
            <ComponentDemo title="Highlights & Custom Day Content" description="Mark events with colored dots, or render your own content in each day cell.">
                <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={columnStyle}>
                        <span style={rowLabelStyle}>Event markers</span>
                        <DatePicker variant="inline" highlightedDates={highlightList} value={eventDate} onChange={setEventDate} ariaLabel="Team calendar" />
                        <div style={rowStyle}>
                            {highlightList.map((h) => (
                                <Tag key={h.label} variant="dot" color={h.color} size="sm">
                                    {h.label}
                                </Tag>
                            ))}
                        </div>
                        <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.8125rem' }} aria-live="polite">
                            {selectedEvent ? `${selectedEvent.label} on ${selectedEvent.date.toDateString()}` : 'No event on the selected day'}
                        </span>
                    </div>
                    <div style={columnStyle}>
                        <span style={rowLabelStyle}>Fares per day</span>
                        <DatePicker variant="inline" minDate={today} renderDay={renderPriceDay} value={flight} onChange={handleFlight} ariaLabel="Flight date" />
                        <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.8125rem' }} aria-live="polite">
                            {flight ? `Fare on ${flight.toDateString()}: $${priceByDay(flight)}` : 'Pick a day to see the fare'}
                        </span>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CustomDays;
