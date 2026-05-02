import classNames from 'classnames';
import React, { useMemo } from 'react';
import './ProgressBar.scss';

type ProgressBarVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ProgressBarLayout = 'default' | 'rounded' | 'sharp' | 'striped' | 'animated';

interface ProgressBarProps {
    value: number;
    max?: number;
    min?: number;
    variant?: ProgressBarVariant;
    size?: ProgressBarSize;
    layout?: ProgressBarLayout;
    showValue?: boolean;
    valueTemplate?: string | ((value: number, max: number) => React.ReactNode);
    label?: React.ReactNode;
    sublabel?: React.ReactNode;
    indeterminate?: boolean;
    buffer?: number;
    multipleValues?: ProgressBarSegment[];
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
    id?: string;
}

interface ProgressBarSegment {
    value: number;
    variant?: ProgressBarVariant;
    label?: string;
}

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const defaultValueTemplate = (value: number, max: number) => {
    const pct = Math.round((value / max) * 100);
    return `${pct}%`;
};

function ProgressBar({
    value,
    max = 100,
    min = 0,
    variant = 'primary',
    size = 'md',
    layout = 'default',
    showValue = false,
    valueTemplate,
    label,
    sublabel,
    indeterminate = false,
    buffer,
    multipleValues,
    className,
    disabled = false,
    ariaLabel,
    id,
}: ProgressBarProps) {
    const percentage = useMemo(() => {
        if (indeterminate) return 0;
        return ((clamp(value, min, max) - min) / (max - min)) * 100;
    }, [value, min, max, indeterminate]);

    const bufferPercentage = useMemo(() => {
        if (buffer === undefined) return undefined;
        return ((clamp(buffer, min, max) - min) / (max - min)) * 100;
    }, [buffer, min, max]);

    const displayValue = useMemo(() => {
        if (!showValue) return null;
        if (typeof valueTemplate === 'function') return valueTemplate(value, max);
        if (typeof valueTemplate === 'string') {
            return valueTemplate
                .replace('{value}', String(value))
                .replace('{max}', String(max))
                .replace('{percent}', String(Math.round(percentage)));
        }
        return defaultValueTemplate(value, max);
    }, [showValue, valueTemplate, value, max, percentage]);

    const rootClasses = classNames(
        'eui-progress-bar',
        `eui-progress-bar-${size}`,
        `eui-progress-bar-${layout}`,
        {
            'eui-progress-bar-disabled': disabled,
            'eui-progress-bar-indeterminate': indeterminate,
            'eui-progress-bar-has-buffer': buffer !== undefined,
        },
        className,
    );

    const renderMultiple = multipleValues && multipleValues.length > 0;

    return (
        <div className={rootClasses} id={id}>
            {(label || displayValue) && (
                <div className="eui-progress-bar-header">
                    <div className="eui-progress-bar-label-group">
                        {label && <span className="eui-progress-bar-label">{label}</span>}
                        {sublabel && <span className="eui-progress-bar-sublabel">{sublabel}</span>}
                    </div>
                    {displayValue && <span className="eui-progress-bar-value">{displayValue}</span>}
                </div>
            )}
            <div
                className="eui-progress-bar-track"
                role="progressbar"
                aria-valuenow={indeterminate ? undefined : value}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuetext={
                    indeterminate
                        ? 'Loading'
                        : renderMultiple
                            ? `${multipleValues.filter((s) => s.value > 0).length} of ${multipleValues.length} segments completed`
                            : undefined
                }
                aria-label={ariaLabel || (typeof label === 'string' ? label : 'Progress')}
            >
                {bufferPercentage !== undefined && !indeterminate && (
                    <div
                        className="eui-progress-bar-buffer"
                        style={{ width: `${bufferPercentage}%` }}
                        aria-hidden="true"
                    />
                )}
                {renderMultiple ? (
                    multipleValues.map((seg, idx) => {
                        const segPct = ((clamp(seg.value, min, max) - min) / (max - min)) * 100;
                        return (
                            <React.Fragment key={idx}>
                                {idx > 0 && <span role="separator" aria-hidden="true" className="eui-progress-bar-segment-sep" />}
                                <div
                                    className={classNames(
                                        'eui-progress-bar-fill',
                                        `eui-progress-bar-fill-${seg.variant || 'primary'}`,
                                    )}
                                    style={{ width: `${segPct}%` }}
                                    role="img"
                                    aria-label={seg.label ? `${seg.label}: ${Math.round(segPct)}%` : `Segment ${idx + 1}: ${Math.round(segPct)}%`}
                                />
                            </React.Fragment>
                        );
                    })
                ) : (
                    <div
                        className={classNames(
                            'eui-progress-bar-fill',
                            `eui-progress-bar-fill-${variant}`,
                            {
                                'eui-progress-bar-fill-striped': layout === 'striped' || layout === 'animated',
                                'eui-progress-bar-fill-animated': layout === 'animated',
                            },
                        )}
                        style={indeterminate ? undefined : { width: `${percentage}%` }}
                        aria-hidden="true"
                    />
                )}
            </div>
        </div>
    );
}

export { ProgressBar };
export type { ProgressBarProps, ProgressBarSegment, ProgressBarVariant, ProgressBarSize, ProgressBarLayout };
