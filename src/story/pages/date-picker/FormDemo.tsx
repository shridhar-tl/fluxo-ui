import React, { useState } from 'react';

import { addDays, isBefore } from 'date-fns';

import { Alert, Button, DatePicker, FieldLabel, TextInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { today } from './date-picker-story-data';

const code = `<form onSubmit={handleSubmit}>
    <DatePicker name="checkIn" value={checkIn} onChange={setCheckIn} minDate={new Date()} required />
    <DatePicker name="checkOut" value={checkOut} onChange={setCheckOut} minDate={checkIn ?? new Date()} required />
    <Button type="submit" label="Book" />
</form>`;

const FormDemo: React.FC = () => {
    const [guest, setGuest] = useState('');
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [submitted, setSubmitted] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    const outBeforeIn = Boolean(checkIn && checkOut && !isBefore(checkIn, checkOut));
    const missing = !checkIn || !checkOut;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTouched(true);
        if (missing || outBeforeIn) {
            setSubmitted(null);
            return;
        }
        const data = new FormData(event.currentTarget);
        setSubmitted(`Booked for ${guest || 'Guest'} · checkIn=${String(data.get('checkIn'))} · checkOut=${String(data.get('checkOut'))}`);
    };

    return (
        <>
            <ComponentDemo title="Form Integration" description="The name prop submits an ISO date through a hidden input, so the picker works with native forms.">
                <form onSubmit={handleSubmit} noValidate style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <FieldLabel label="Guest name" htmlFor="dp-form-guest">
                        <TextInput id="dp-form-guest" value={guest} onChange={(event) => setGuest(String(event.value ?? ''))} placeholder="Ava Chen" />
                    </FieldLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <FieldLabel label="Check-in" htmlFor="dp-form-in" required error={touched && !checkIn ? 'Required' : undefined}>
                            <DatePicker
                                id="dp-form-in"
                                name="checkIn"
                                value={checkIn}
                                onChange={(d) => {
                                    setCheckIn(d);
                                    if (d && checkOut && !isBefore(d, checkOut)) setCheckOut(addDays(d, 1));
                                }}
                                minDate={today}
                                required
                                status={touched && !checkIn ? 'error' : undefined}
                                fullWidth
                            />
                        </FieldLabel>
                        <FieldLabel
                            label="Check-out"
                            htmlFor="dp-form-out"
                            required
                            error={touched && !checkOut ? 'Required' : outBeforeIn ? 'Must be after check-in' : undefined}
                        >
                            <DatePicker
                                id="dp-form-out"
                                name="checkOut"
                                value={checkOut}
                                onChange={setCheckOut}
                                minDate={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
                                required
                                status={(touched && !checkOut) || outBeforeIn ? 'error' : undefined}
                                fullWidth
                            />
                        </FieldLabel>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button type="submit" label="Book stay" variant="primary" />
                        <Button
                            label="Reset"
                            layout="outlined"
                            onClick={() => {
                                setCheckIn(null);
                                setCheckOut(null);
                                setGuest('');
                                setTouched(false);
                                setSubmitted(null);
                            }}
                        />
                    </div>
                    {submitted && <Alert type="success" size="sm" title="Reservation confirmed" description={submitted} />}
                </form>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default FormDemo;
