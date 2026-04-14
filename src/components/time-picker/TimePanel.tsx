import cn from 'classnames';
import React, { useEffect, useRef } from 'react';
import { buildRange, pad, TimeValue } from './utils';

interface TimePanelProps {
    value: TimeValue;
    format12: boolean;
    showSeconds: boolean;
    hourStep: number;
    minuteStep: number;
    secondStep: number;
    onChange: (next: TimeValue) => void;
    onConfirm?: () => void;
    onNow?: () => void;
    showFooter?: boolean;
}

const ITEM_HEIGHT = 28;

const TimeColumn: React.FC<{
    values: number[];
    current: number;
    format?: (n: number) => string;
    onSelect: (n: number) => void;
}> = ({ values, current, format = pad, onSelect }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const idx = values.indexOf(current);
        if (idx >= 0) {
            ref.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
        }
    }, [current, values]);

    return (
        <div className="eui-time-col" ref={ref}>
            {values.map((v) => (
                <button
                    key={v}
                    type="button"
                    className={cn('eui-time-cell', { 'eui-time-cell-active': v === current })}
                    onClick={() => onSelect(v)}
                >
                    {format(v)}
                </button>
            ))}
        </div>
    );
};

const TimePanel: React.FC<TimePanelProps> = ({
    value,
    format12,
    showSeconds,
    hourStep,
    minuteStep,
    secondStep,
    onChange,
    onConfirm,
    onNow,
    showFooter = true,
}) => {
    const hourValues = format12
        ? buildRange(1, 12, hourStep).filter((n) => n <= 12)
        : buildRange(0, 23, hourStep);
    const minuteValues = buildRange(0, 59, minuteStep);
    const secondValues = buildRange(0, 59, secondStep);

    const currentHour12 = value.hours % 12 === 0 ? 12 : value.hours % 12;
    const isPm = value.hours >= 12;

    const handleHour = (h: number) => {
        if (format12) {
            const base = h === 12 ? 0 : h;
            const hours = isPm ? base + 12 : base;
            onChange({ ...value, hours });
        } else {
            onChange({ ...value, hours: h });
        }
    };

    const handleMinute = (m: number) => onChange({ ...value, minutes: m });
    const handleSecond = (s: number) => onChange({ ...value, seconds: s });

    const handleAmPm = (pm: boolean) => {
        let hours = value.hours % 12;
        if (pm) hours += 12;
        onChange({ ...value, hours });
    };

    return (
        <div className="eui-time-panel" onPointerDown={(e) => e.stopPropagation()}>
            <div className="eui-time-cols">
                <TimeColumn
                    values={hourValues}
                    current={format12 ? currentHour12 : value.hours}
                    onSelect={handleHour}
                />
                <TimeColumn values={minuteValues} current={value.minutes} onSelect={handleMinute} />
                {showSeconds && (
                    <TimeColumn values={secondValues} current={value.seconds} onSelect={handleSecond} />
                )}
                {format12 && (
                    <div className="eui-time-col eui-time-col-ampm">
                        <button
                            type="button"
                            className={cn('eui-time-cell', { 'eui-time-cell-active': !isPm })}
                            onClick={() => handleAmPm(false)}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            className={cn('eui-time-cell', { 'eui-time-cell-active': isPm })}
                            onClick={() => handleAmPm(true)}
                        >
                            PM
                        </button>
                    </div>
                )}
            </div>

            {showFooter && (
                <div className="eui-time-footer">
                    {onNow && (
                        <button type="button" className="eui-time-btn eui-time-btn-link" onClick={onNow}>
                            Now
                        </button>
                    )}
                    {onConfirm && (
                        <button type="button" className="eui-time-btn eui-time-btn-primary" onClick={onConfirm}>
                            OK
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TimePanel;
