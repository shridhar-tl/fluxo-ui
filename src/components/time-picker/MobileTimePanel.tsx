import cn from 'classnames';
import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../../assets/icons';
import { TimeValue, pad } from './utils';

interface MobileTimePanelProps {
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

const wrap = (n: number, max: number) => {
    if (n < 0) return max;
    if (n > max) return 0;
    return n;
};

const MobileTimePanel: React.FC<MobileTimePanelProps> = ({
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
    const isPm = value.hours >= 12;
    const display12Hour = (() => {
        const h = value.hours % 12;
        return h === 0 ? 12 : h;
    })();

    const stepHour = (delta: number) => {
        if (format12) {
            const next = wrap(display12Hour + delta * hourStep, 12);
            const base = next === 12 ? 0 : next;
            onChange({ ...value, hours: isPm ? base + 12 : base });
            return;
        }
        onChange({ ...value, hours: wrap(value.hours + delta * hourStep, 23) });
    };

    const stepMinute = (delta: number) => {
        onChange({ ...value, minutes: wrap(value.minutes + delta * minuteStep, 59) });
    };

    const stepSecond = (delta: number) => {
        onChange({ ...value, seconds: wrap(value.seconds + delta * secondStep, 59) });
    };

    const toggleAmPm = () => {
        const hours = isPm ? value.hours - 12 : value.hours + 12;
        onChange({ ...value, hours });
    };

    const displayString = (() => {
        const hh = format12 ? pad(display12Hour) : pad(value.hours);
        const mm = pad(value.minutes);
        const ss = pad(value.seconds);
        const suffix = format12 ? ` ${isPm ? 'PM' : 'AM'}` : '';
        return showSeconds ? `${hh}:${mm}:${ss}${suffix}` : `${hh}:${mm}${suffix}`;
    })();

    const renderColumn = (label: string, displayValue: string, onUp: () => void, onDown: () => void) => (
        <div className="eui-time-mobile-col">
            <button
                type="button"
                className="eui-time-mobile-col-step"
                onClick={onUp}
                aria-label={`Increase ${label}`}
            >
                <ChevronUpIcon />
            </button>
            <div className="eui-time-mobile-col-value" aria-live="polite" aria-label={`${label} ${displayValue}`}>
                {displayValue}
            </div>
            <button
                type="button"
                className="eui-time-mobile-col-step"
                onClick={onDown}
                aria-label={`Decrease ${label}`}
            >
                <ChevronDownIcon />
            </button>
            <div className="eui-time-mobile-col-label">{label}</div>
        </div>
    );

    return (
        <div className="eui-time-mobile-panel">
            <div className="eui-time-mobile-display" aria-live="polite">
                {displayString}
            </div>
            <div className="eui-time-mobile-cols">
                {renderColumn(
                    'Hour',
                    format12 ? pad(display12Hour) : pad(value.hours),
                    () => stepHour(1),
                    () => stepHour(-1),
                )}
                <div className="eui-time-mobile-sep">:</div>
                {renderColumn('Minute', pad(value.minutes), () => stepMinute(1), () => stepMinute(-1))}
                {showSeconds && (
                    <>
                        <div className="eui-time-mobile-sep">:</div>
                        {renderColumn('Second', pad(value.seconds), () => stepSecond(1), () => stepSecond(-1))}
                    </>
                )}
                {format12 && (
                    <div className="eui-time-mobile-ampm">
                        <button
                            type="button"
                            className={cn('eui-time-mobile-ampm-btn', { 'eui-time-mobile-ampm-btn-active': !isPm })}
                            onClick={() => isPm && toggleAmPm()}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            className={cn('eui-time-mobile-ampm-btn', { 'eui-time-mobile-ampm-btn-active': isPm })}
                            onClick={() => !isPm && toggleAmPm()}
                        >
                            PM
                        </button>
                    </div>
                )}
            </div>
            {showFooter && (
                <div className="eui-time-mobile-footer">
                    {onNow && (
                        <button type="button" className="eui-time-mobile-btn eui-time-mobile-btn-link" onClick={onNow}>
                            Now
                        </button>
                    )}
                    {onConfirm && (
                        <button type="button" className="eui-time-mobile-btn eui-time-mobile-btn-primary" onClick={onConfirm}>
                            OK
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MobileTimePanel;
