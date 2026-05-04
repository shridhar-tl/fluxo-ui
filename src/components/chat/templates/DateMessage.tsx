import React from 'react';
import DateRangePicker from '../../date-range';
import { Button } from '../../Button';
import type { MessageRenderProps } from '../types';

function toDate(value: any): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
}

function DateMessageTemplate({ message, onSendMessage }: MessageRenderProps) {
    const flowId = message.media?.flowId;
    const minDate = toDate(message.media?.minDate);
    const maxDate = toDate(message.media?.maxDate);
    const [value, setValue] = React.useState<Date | undefined>(undefined);
    const [submitted, setSubmitted] = React.useState(false);

    if (submitted && value) {
        return <div className="eui-chat-msg-text">{value.toLocaleDateString()}</div>;
    }

    const handleChange = (selection: any) => {
        const v = Array.isArray(selection?.value) ? selection.value[0] : selection?.value;
        if (v instanceof Date) setValue(v);
    };

    const handleSubmit = () => {
        if (!value) return;
        setSubmitted(true);
        onSendMessage?.({
            method: 'flow-response',
            type: 'question',
            answer: value.toISOString().slice(0, 10),
            flowId,
        });
    };

    return (
        <div className="eui-chat-date-template">
            {message.content && <div className="eui-chat-msg-text" style={{ marginBottom: 8 }}>{message.content}</div>}
            <DateRangePicker
                range={false}
                minDate={minDate}
                maxDate={maxDate}
                onChange={handleChange}
                value={value}
                placeholder="Select date"
            />
            <div className="eui-chat-template-actions">
                <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!value}>
                    Submit
                </Button>
            </div>
        </div>
    );
}

(DateMessageTemplate as any).showTime = true;

export default DateMessageTemplate;
