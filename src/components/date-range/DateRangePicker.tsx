import classNames from 'classnames';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CalendarIcon } from '../../assets/icons';
import '../eui-base.scss';
import './date-range.scss';
import DatePopover from './DatePopover';
import { ContextType, DatePickerPropsContext, DateRangePickerProps, DateRangeValue, RangeOption, StateProvider } from './types';
import { formatDisplayDate } from './utils';

function DateRangePicker(props: DateRangePickerProps) {
    const $props = useRef(props);
    $props.current = props;
    const { id, value, ranges, className, onChange, onClose, dateFormat, styles, disabled, iconOnly } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [activeView, setActiveView] = useState<'quick' | 'custom'>(
        typeof value === 'string' || typeof value === 'number' ? 'quick' : 'custom',
    );
    const [selectedRange, setSelectedRange] = useState<string | number | 'custom'>(
        typeof value === 'string' || typeof value === 'number' ? value : 'custom',
    );

    useEffect(() => {
        if (!value) return;
        if (typeof value === 'string' && ranges?.length) {
            setSelectedRange(value);
            setActiveView('quick');
        } else if (ranges?.length && Array.isArray(value) && value.length === 2) {
            setCustomRange(value);
            setSelectedRange('custom');
            setActiveView('custom');
        }
    }, [value]);

    const [customRange, setCustomRange] = useState<DateRangeValue>(Array.isArray(value) ? value : [new Date(), new Date()]);

    const controlRef = useRef<HTMLButtonElement>(null!);
    const generatedId = useId();
    const popoverId = `eui-drp-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const closePicker = useCallback(() => {
        setIsOpen(false);
        onClose?.();
    }, [onClose]);

    const displayLabel = () => {
        const isRange = props.range !== false;
        if (activeView === 'quick' && ranges) {
            const found = ranges.find((r) => r.value === selectedRange);
            if (found) return found.label;
        }
        if (!isRange) {
            return formatDisplayDate(customRange[0], dateFormat);
        }
        return `${formatDisplayDate(customRange[0], dateFormat)} ~ ${formatDisplayDate(customRange[1], dateFormat)}`;
    };

    const setCustomDate = useCallback(
        (range: DateRangeValue) => {
            setCustomRange(range);
            setSelectedRange('custom');
            setActiveView('custom');
            $props.current.onChange({ name: $props.current.name, args: $props.current.args, value: range });
            closePicker();
        },
        [closePicker],
    );

    const setQuickDate = useCallback(
        (option: RangeOption | { custom: true }) => {
            if ('custom' in option) {
                setSelectedRange('custom');
                setActiveView('custom');
            } else {
                setSelectedRange(option.value);
                setCustomRange(option.range);
                setActiveView('quick');
                onChange({ name: $props.current.name, args: $props.current.args, range: option.value, value: option.range });
                closePicker();
            }
        },
        [onChange, closePicker],
    );

    const contextValue = useMemo<ContextType>(
        () => ({
            selectedRange,
            activeView,
            customRange,
            setCustomRange,
            setActiveView,
            setCustomDate,
            setQuickDate,
            closePicker,
        }),
        [selectedRange, activeView, customRange, setCustomDate, setQuickDate],
    );

    return (
        <DatePickerPropsContext value={props as any}>
            <StateProvider value={contextValue}>
                <div id={id} className={classNames('eui-date-range-picker', className, props.classNames?.container)} style={styles}>
                    <button
                        ref={controlRef}
                        type="button"
                        className={classNames('eui-drp-control', { 'eui-drp-control-icon-only': iconOnly }, props.classNames?.control)}
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={disabled}
                        aria-haspopup="dialog"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? popoverId : undefined}
                        aria-label={iconOnly ? `${props.ariaLabel ?? 'Choose date range'}${displayLabel() ? `: ${displayLabel()}` : ''}` : props.ariaLabel}
                    >
                        {!iconOnly && <span className="eui-drp-control-label">{displayLabel()}</span>}
                        <CalendarIcon className="eui-drp-control-icon" aria-hidden="true" />
                    </button>
                    {isOpen && <DatePopover controlRef={controlRef} popoverId={popoverId} />}
                </div>
            </StateProvider>
        </DatePickerPropsContext>
    );
}

export default DateRangePicker;
