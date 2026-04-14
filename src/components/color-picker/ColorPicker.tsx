import cn from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ColorPanel from './ColorPanel';
import './color-picker.scss';
import { hexToRgb } from './utils';

type ColorPickerSize = 'sm' | 'md' | 'lg';
type ColorPickerVariant = 'button' | 'swatch' | 'input';
type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl';

interface ColorPickerProps {
    value?: string;
    defaultValue?: string;
    alpha?: number;
    defaultAlpha?: number;
    format?: ColorFormat;
    size?: ColorPickerSize;
    variant?: ColorPickerVariant;
    disabled?: boolean;
    readOnly?: boolean;
    editable?: boolean;
    showAlpha?: boolean;
    showInputs?: boolean;
    showSwatches?: boolean;
    swatches?: string[];
    placeholder?: string;
    className?: string;
    ariaLabel?: string;
    onChange?: (value: string, alpha: number) => void;
    onOpenChange?: (open: boolean) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
    value: controlledValue,
    defaultValue = '#3b82f6',
    alpha: controlledAlpha,
    defaultAlpha = 1,
    format = 'hex',
    size = 'md',
    variant = 'button',
    disabled = false,
    readOnly = false,
    editable = false,
    showAlpha = true,
    showInputs = true,
    showSwatches = true,
    swatches,
    placeholder = 'Pick a color',
    className,
    ariaLabel,
    onChange,
    onOpenChange,
}) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalAlpha, setInternalAlpha] = useState(defaultAlpha);
    const [isOpen, setIsOpen] = useState(false);
    const [popStyle, setPopStyle] = useState<React.CSSProperties>();
    const triggerRef = useRef<HTMLElement>(null);
    const popRef = useRef<HTMLDivElement>(null);

    const currentValue = controlledValue ?? internalValue;
    const currentAlpha = controlledAlpha ?? internalAlpha;
    const interactive = !disabled && !readOnly;

    const [hexText, setHexText] = useState(currentValue);
    useEffect(() => {
        setHexText(currentValue);
    }, [currentValue]);

    const computePosition = useCallback(() => {
        if (!triggerRef.current || !popRef.current) return;
        const t = triggerRef.current.getBoundingClientRect();
        const p = popRef.current.getBoundingClientRect();
        const padding = 4;
        let top = t.bottom + padding;
        let left = t.left;
        if (top + p.height > window.innerHeight) {
            top = Math.max(padding, t.top - p.height - padding);
        }
        if (left + p.width > window.innerWidth) {
            left = Math.max(padding, window.innerWidth - p.width - padding);
        }
        setPopStyle({ top: `${top + window.scrollY}px`, left: `${left + window.scrollX}px` });
    }, []);

    useLayoutEffect(() => {
        if (isOpen) {
            computePosition();
        }
    }, [isOpen, computePosition]);

    useEffect(() => {
        if (!isOpen) return;
        const onResize = () => computePosition();
        const onClickOutside = (e: MouseEvent) => {
            if (
                popRef.current &&
                !popRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                onOpenChange?.(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                onOpenChange?.(false);
            }
        };
        window.addEventListener('resize', onResize);
        document.addEventListener('scroll', onResize, true);
        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('resize', onResize);
            document.removeEventListener('scroll', onResize, true);
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen, computePosition, onOpenChange]);

    const handleChange = useCallback(
        (hex: string, a: number) => {
            if (controlledValue === undefined) setInternalValue(hex);
            if (controlledAlpha === undefined) setInternalAlpha(a);
            onChange?.(hex, a);
        },
        [controlledValue, controlledAlpha, onChange],
    );

    const handleToggle = () => {
        if (!interactive) return;
        setIsOpen((prev) => {
            const next = !prev;
            onOpenChange?.(next);
            return next;
        });
    };

    const formatted = (() => {
        if (format === 'hex') return currentValue;
        const hex = currentValue.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        if (format === 'rgb') return `rgb(${r}, ${g}, ${b})`;
        if (format === 'rgba') return `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
        return currentValue;
    })();

    const renderTrigger = () => {
        if (variant === 'swatch') {
            return (
                <button
                    ref={triggerRef as React.RefObject<HTMLButtonElement>}
                    type="button"
                    disabled={disabled}
                    onClick={handleToggle}
                    className={cn('eui-color-picker-swatch', `eui-color-picker-${size}`)}
                    aria-label={ariaLabel ?? placeholder}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                >
                    <span className="eui-color-picker-chk" />
                    <span className="eui-color-picker-fill" style={{ backgroundColor: currentValue, opacity: currentAlpha }} />
                </button>
            );
        }
        if (variant === 'input') {
            if (editable) {
                const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const raw = e.target.value;
                    setHexText(raw);
                    const normalized = raw.startsWith('#') ? raw : `#${raw}`;
                    if (hexToRgb(normalized)) {
                        handleChange(normalized.toLowerCase(), currentAlpha);
                    }
                };
                const handleHexBlur = () => {
                    const normalized = hexText.startsWith('#') ? hexText : `#${hexText}`;
                    if (hexToRgb(normalized)) {
                        setHexText(normalized.toLowerCase());
                    } else {
                        setHexText(currentValue);
                    }
                };
                return (
                    <div
                        ref={triggerRef as React.RefObject<HTMLDivElement>}
                        className={cn('eui-color-picker-editable', `eui-color-picker-${size}`, { 'eui-color-picker-editable-disabled': disabled })}
                    >
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={handleToggle}
                            className="eui-color-picker-editable-swatch"
                            aria-label={ariaLabel ?? placeholder}
                            aria-haspopup="dialog"
                            aria-expanded={isOpen}
                        >
                            <span className="eui-color-picker-dot-chk" />
                            <span className="eui-color-picker-dot-fill" style={{ backgroundColor: currentValue, opacity: currentAlpha }} />
                        </button>
                        <input
                            type="text"
                            className="eui-color-picker-editable-input"
                            value={hexText}
                            placeholder={placeholder}
                            disabled={disabled}
                            readOnly={readOnly}
                            spellCheck={false}
                            onChange={handleHexChange}
                            onBlur={handleHexBlur}
                            onFocus={(e) => e.currentTarget.select()}
                            aria-label={ariaLabel ?? placeholder}
                        />
                    </div>
                );
            }
            return (
                <button
                    ref={triggerRef as React.RefObject<HTMLButtonElement>}
                    type="button"
                    disabled={disabled}
                    onClick={handleToggle}
                    className={cn('eui-color-picker-input-trigger', `eui-color-picker-${size}`)}
                    aria-label={ariaLabel ?? placeholder}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                >
                    <span className="eui-color-picker-dot">
                        <span className="eui-color-picker-dot-chk" />
                        <span className="eui-color-picker-dot-fill" style={{ backgroundColor: currentValue, opacity: currentAlpha }} />
                    </span>
                    <span className="eui-color-picker-text">{formatted}</span>
                </button>
            );
        }
        return (
            <button
                ref={triggerRef as React.RefObject<HTMLButtonElement>}
                type="button"
                disabled={disabled}
                onClick={handleToggle}
                className={cn('eui-color-picker-button', `eui-color-picker-${size}`)}
                aria-label={ariaLabel ?? placeholder}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <span className="eui-color-picker-dot">
                    <span className="eui-color-picker-dot-chk" />
                    <span className="eui-color-picker-dot-fill" style={{ backgroundColor: currentValue, opacity: currentAlpha }} />
                </span>
                <span className="eui-color-picker-text">{formatted}</span>
            </button>
        );
    };

    return (
        <div
            className={cn(
                'eui-color-picker',
                `eui-color-picker-${variant}-wrap`,
                {
                    'eui-color-picker-disabled': disabled,
                    'eui-color-picker-readonly': readOnly,
                    'eui-color-picker-open': isOpen,
                },
                className,
            )}
        >
            {renderTrigger()}
            {isOpen &&
                createPortal(
                    <div
                        ref={popRef}
                        className={cn('eui-color-picker-popover', { 'eui-color-picker-popover-hidden': !popStyle })}
                        style={popStyle}
                        role="dialog"
                        aria-label="Color picker"
                    >
                        <ColorPanel
                            value={currentValue}
                            alpha={currentAlpha}
                            showAlpha={showAlpha}
                            showInputs={showInputs}
                            showSwatches={showSwatches}
                            swatches={swatches}
                            onChange={handleChange}
                        />
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export { ColorPicker };
export type { ColorPickerProps, ColorPickerSize, ColorPickerVariant, ColorFormat };
