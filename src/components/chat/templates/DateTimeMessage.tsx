import React from 'react';
import { Button } from '../../Button';
import DateRangePicker from '../../date-range';
import { TimePicker } from '../../time-picker';
import type { MessageRenderProps } from '../types';

function toDate(value: any): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
}

function DateTimeMessageTemplate({ message, onSendMessage }: MessageRenderProps) {
    const flowId = message.media?.flowId;
    const minDate = toDate(message.media?.minDate);
    const maxDate = toDate(message.media?.maxDate);
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [time, setTime] = React.useState<string>('');
    const [submitted, setSubmitted] = React.useState(false);

    if (submitted && date) {
        return <div className="eui-chat-msg-text">{date.toLocaleDateString()} {time}</div>;
    }

    const handleDateChange = (selection: any) => {
        const v = Array.isArray(selection?.value) ? selection.value[0] : selection?.value;
        if (v instanceof Date) setDate(v);
    };

    const handleTimeChange = (v: any) => {
        const stringVal = typeof v === 'string' ? v : v ? `${String(v.hours).padStart(2, '0')}:${String(v.minutes).padStart(2, '0')}` : '';
        setTime(stringVal);
    };

    const handleSubmit = () => {
        if (!date || !time) return;
        setSubmitted(true);
        const dateStr = date.toISOString().slice(0, 10);
        onSendMessage?.({
            method: 'flow-response',
            type: 'question',
            answer: `${dateStr} ${time}`,
            flowId,
        });
    };

    return (
        <div className="eui-chat-datetime-template">
            {message.content && <div className="eui-chat-msg-text" style={{ marginBottom: 8 }}>{message.content}</div>}
            <div className="eui-chat-datetime-row">
                <DateRangePicker range={false} minDate={minDate} maxDate={maxDate} onChange={handleDateChange} value={date} placeholder="Select date" />
                <TimePicker value={time} onChange={handleTimeChange} placeholder="HH:MM" />
            </div>
            <div className="eui-chat-template-actions">
                <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!date || !time}>
                    Submit
                </Button>
            </div>
        </div>
    );
}

(DateTimeMessageTemplate as any).showTime = true;

export default DateTimeMessageTemplate;
