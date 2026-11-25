import React, { useCallback, useState } from 'react';

import { Button, DatePicker, FieldLabel, InputSwitch } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowStyle } from '../../demo-styles';
import { isWeekendDay, parseNaturalDate, today } from './date-picker-story-data';

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const hintStyle: React.CSSProperties = { color: 'var(--eui-text-muted)', fontSize: '0.75rem', marginTop: '0.375rem' };

const maxLogEntries = 6;

const code = `const parseNaturalDate = (text: string) => {
    if (text === 'today') return startOfDay(new Date());
    if (text === 'tomorrow') return addDays(startOfDay(new Date()), 1);
    const relative = text.match(/^([+-])(\\d+)d$/);
    if (relative) return addDays(startOfDay(new Date()), Number(relative[2]) * (relative[1] === '-' ? -1 : 1));
    const iso = parseISO(text);
    return isValid(iso) ? iso : null;
};

<DatePicker parseDate={parseNaturalDate} ariaDescribedBy="natural-hint" />

<DatePicker
    open={open}
    onOpenChange={setOpen}
    onFocus={() => log('focus')}
    onBlur={() => log('blur')}
    dayClassName={(date) => (isWeekend(date) ? 'italic' : undefined)}
    popoverClassName="shadow-2xl"
    responsive={responsive}
/>`;

const EventsParsing: React.FC = () => {
    const [natural, setNatural] = useState<Date | null>(null);
    const [date, setDate] = useState<Date | null>(today);
    const [open, setOpen] = useState(false);
    const [responsive, setResponsive] = useState(true);
    const [events, setEvents] = useState<string[]>([]);

    const log = useCallback((entry: string) => {
        const stamp = new Date().toLocaleTimeString();
        setEvents((prev) => [`${stamp} · ${entry}`, ...prev].slice(0, maxLogEntries));
    }, []);

    const handleOpenChange = useCallback(
        (next: boolean) => {
            setOpen(next);
            log(`onOpenChange(${next})`);
        },
        [log],
    );

    const handleChange = useCallback(
        (next: Date | null) => {
            setDate(next);
            log(`onChange(${next ? next.toDateString() : 'null'})`);
        },
        [log],
    );

    return (
        <>
            <ComponentDemo
                title="Custom Parsing, Events & Styling Hooks"
                description="Accept natural input with parseDate, control the popover with open and onOpenChange, listen to focus events, and style days or the popover with your own classes."
                centered={false}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={gridStyle}>
                        <FieldLabel label="Natural language input" htmlFor="dp-natural">
                            <DatePicker
                                id="dp-natural"
                                value={natural}
                                onChange={setNatural}
                                parseDate={parseNaturalDate}
                                placeholder="today, +3d, 2w, 2026-12-24"
                                ariaDescribedBy="dp-natural-hint"
                                clearable
                                fullWidth
                            />
                            <div id="dp-natural-hint" style={hintStyle}>
                                Type today, tomorrow, +3d, -1w, +2m or an ISO date, then press Enter.
                            </div>
                        </FieldLabel>
                        <FieldLabel label="Controlled popover" htmlFor="dp-events">
                            <DatePicker
                                id="dp-events"
                                value={date}
                                onChange={handleChange}
                                open={open}
                                onOpenChange={handleOpenChange}
                                onFocus={() => log('onFocus')}
                                onBlur={() => log('onBlur')}
                                dayClassName={(day) => (isWeekendDay(day) ? 'italic' : undefined)}
                                popoverClassName="shadow-2xl"
                                responsive={responsive}
                                fullWidth
                            />
                        </FieldLabel>
                    </div>
                    <div style={{ ...rowStyle, gap: '1rem' }}>
                        <Button label={open ? 'Close calendar' : 'Open calendar'} size="sm" variant="primary" onClick={() => handleOpenChange(!open)} />
                        <InputSwitch
                            label="Full-screen sheet on small screens"
                            checked={responsive}
                            onChange={(event) => setResponsive(Boolean(event.value))}
                        />
                        <Button label="Clear log" size="sm" layout="plain" onClick={() => setEvents([])} disabled={events.length === 0} />
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        <div>Natural value: {natural ? natural.toDateString() : 'none'}</div>
                        {events.length === 0 ? (
                            <div>Interact with the controlled picker to see events.</div>
                        ) : (
                            events.map((entry, index) => <div key={`${index}-${entry}`}>{entry}</div>)
                        )}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default EventsParsing;
