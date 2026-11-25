import React, { useState } from 'react';

import { DatePicker, Dropdown, FieldLabel } from '../../../components';
import type { DayOfWeek } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { formatOptions, localeOptions, today, weekStartOptions } from './date-picker-story-data';

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const FormatsLocale: React.FC = () => {
    const [date, setDate] = useState<Date | null>(today);
    const [pattern, setPattern] = useState('MMM d, yyyy');
    const [locale, setLocale] = useState('de-DE');
    const [weekStart, setWeekStart] = useState('1');
    const firstDayOfWeek = (weekStartOptions.find((o) => o.value === weekStart)?.day ?? 1) as DayOfWeek;

    const code = `<DatePicker format="${pattern}" />
<DatePicker locale="${locale}" firstDayOfWeek={${firstDayOfWeek}} showWeekNumbers />`;

    return (
        <>
            <ComponentDemo
                title="Formats, Locales & Week Start"
                description="Display formats use date-fns patterns. Month and weekday names come from the browser's Intl support for any locale."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={gridStyle}>
                        <FieldLabel label="Format pattern" htmlFor="dp-format-select">
                            <Dropdown id="dp-format-select" options={formatOptions} value={pattern} onChange={(event) => setPattern(String(event.value))} />
                        </FieldLabel>
                        <FieldLabel label="Locale" htmlFor="dp-locale-select">
                            <Dropdown id="dp-locale-select" options={localeOptions} value={locale} onChange={(event) => setLocale(String(event.value))} />
                        </FieldLabel>
                        <FieldLabel label="Week starts on" htmlFor="dp-week-select">
                            <Dropdown id="dp-week-select" options={weekStartOptions} value={weekStart} onChange={(event) => setWeekStart(String(event.value))} />
                        </FieldLabel>
                    </div>
                    <div style={gridStyle}>
                        <FieldLabel label="Custom format" htmlFor="dp-format">
                            <DatePicker id="dp-format" value={date} onChange={setDate} format={pattern} fullWidth />
                        </FieldLabel>
                        <FieldLabel label="Localized with week numbers" htmlFor="dp-locale">
                            <DatePicker id="dp-locale" value={date} onChange={setDate} locale={locale} firstDayOfWeek={firstDayOfWeek} showWeekNumbers fullWidth />
                        </FieldLabel>
                        <FieldLabel label="Custom formatter" htmlFor="dp-formatter">
                            <DatePicker
                                id="dp-formatter"
                                value={date}
                                onChange={setDate}
                                formatDate={(d) => `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                editable={false}
                                fullWidth
                            />
                        </FieldLabel>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default FormatsLocale;
