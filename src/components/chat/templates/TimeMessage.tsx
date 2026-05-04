import React from 'react';
import { Button } from '../../Button';
import { TimePicker } from '../../time-picker';
import type { MessageRenderProps } from '../types';

function TimeMessageTemplate({ message, onSendMessage }: MessageRenderProps) {
    const flowId = message.media?.flowId;
    const minTime = message.media?.minTime as string | undefined;
    const maxTime = message.media?.maxTime as string | undefined;
    const [value, setValue] = React.useState<string>('');
    const [error, setError] = React.useState<string | null>(null);
    const [submitted, setSubmitted] = React.useState(false);

    if (submitted && value) {
        return <div className="eui-chat-msg-text">{value}</div>;
    }

    const validate = (v: string): string | null => {
        if (!v) return 'Time is required.';
        if (minTime && v < minTime) return `Must be after ${minTime}.`;
        if (maxTime && v > maxTime) return `Must be before ${maxTime}.`;
        return null;
    };

    const handleSubmit = () => {
        const err = validate(value);
        if (err) {
            setError(err);
            return;
        }
        setSubmitted(true);
        onSendMessage?.({
            method: 'flow-response',
            type: 'question',
            answer: value,
            flowId,
        });
    };

    return (
        <div className="eui-chat-time-template">
            {message.content && <div className="eui-chat-msg-text" style={{ marginBottom: 8 }}>{message.content}</div>}
            <TimePicker
                value={value}
                onChange={(v: any) => {
                    const stringVal = typeof v === 'string' ? v : v ? `${String(v.hours).padStart(2, '0')}:${String(v.minutes).padStart(2, '0')}` : '';
                    setValue(stringVal);
                    setError(null);
                }}
                placeholder="HH:MM"
            />
            {error && <div className="eui-chat-template-error">{error}</div>}
            <div className="eui-chat-template-actions">
                <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!value}>
                    Submit
                </Button>
            </div>
        </div>
    );
}

(TimeMessageTemplate as any).showTime = true;

export default TimeMessageTemplate;
