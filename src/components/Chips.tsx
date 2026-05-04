import classNames from 'classnames';
import React, { forwardRef, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { TimesIcon } from '../assets/icons';
import { BaseComponentProps, ComponentEvent } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize, splitBaseAndNativeProps } from '../utils';
import './Chips.scss';

interface ChipsProps extends BaseComponentProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value?: string[];
    onChange?: (event: ComponentEvent<string[]>) => void;
    placeholder?: string;
    maxItems?: number;
    allowDuplicates?: boolean;
    separator?: string;
    disabled?: boolean;
    readonly?: boolean;
    id?: string;
    name?: string;
    ariaLabel?: string;
    commitOnTab?: boolean;
}

export const Chips = forwardRef<HTMLDivElement, ChipsProps>(
    (
        {
            value,
            onChange,
            placeholder = 'Type and press Enter to add',
            maxItems,
            allowDuplicates = false,
            separator = ',',
            disabled = false,
            readonly = false,
            id,
            className,
            name,
            args,
            ariaLabel,
            commitOnTab = true,
            ...rest
        },
        ref,
    ) => {
        const { styleProps: baseProps, nativeProps } = splitBaseAndNativeProps(rest);
        const [inputId] = useState(id || generateId());
        const [inputValue, setInputValue] = useState('');
        const [focusedChipIndex, setFocusedChipIndex] = useState(-1);
        const [internalValue, setInternalValue] = useState<string[]>([]);
        const inputRef = useRef<HTMLInputElement>(null);
        const chipRefs = useRef<Array<HTMLSpanElement | null>>([]);

        const isControlled = value !== undefined;
        const currentValue = isControlled ? value : internalValue;

        useEffect(() => {
            if (focusedChipIndex >= 0) {
                chipRefs.current[focusedChipIndex]?.focus();
            }
        }, [focusedChipIndex]);

        const emitChange = (newValue: string[]) => {
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.({
                event: { target: { value: newValue } } as any,
                value: newValue,
                name,
                args,
            });
        };

        const addChip = (chipValue: string) => {
            const trimmedValue = chipValue.trim();
            if (!trimmedValue) return;

            if (!allowDuplicates && currentValue.includes(trimmedValue)) return;
            if (maxItems && currentValue.length >= maxItems) return;

            emitChange([...currentValue, trimmedValue]);
            setInputValue('');
        };

        const removeChip = (index: number) => {
            emitChange(currentValue.filter((_, i) => i !== index));
            setFocusedChipIndex(-1);
            inputRef.current?.focus();
        };

        const commitInput = () => {
            if (inputValue.includes(separator)) {
                const chips = inputValue
                    .split(separator)
                    .map((s) => s.trim())
                    .filter(Boolean);
                chips.forEach(addChip);
            } else {
                addChip(inputValue);
            }
        };

        const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    commitInput();
                    break;
                case 'Tab':
                    if (commitOnTab && inputValue.trim().length > 0) {
                        e.preventDefault();
                        commitInput();
                    }
                    break;
                case 'Backspace':
                    if (!inputValue && currentValue.length > 0) {
                        e.preventDefault();
                        setFocusedChipIndex(currentValue.length - 1);
                    }
                    break;
                case 'ArrowLeft':
                    if (!inputValue && currentValue.length > 0) {
                        e.preventDefault();
                        setFocusedChipIndex(currentValue.length - 1);
                    }
                    break;
                case 'Home':
                    if (!inputValue && currentValue.length > 0) {
                        e.preventDefault();
                        setFocusedChipIndex(0);
                    }
                    break;
            }
        };

        const handleChipKeyDown = (e: KeyboardEvent<HTMLSpanElement>, index: number) => {
            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    removeChip(index);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (index > 0) {
                        setFocusedChipIndex(index - 1);
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (index < currentValue.length - 1) {
                        setFocusedChipIndex(index + 1);
                    } else {
                        setFocusedChipIndex(-1);
                        inputRef.current?.focus();
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    if (currentValue.length > 0) {
                        setFocusedChipIndex(0);
                    }
                    break;
                case 'End':
                    e.preventDefault();
                    if (currentValue.length > 0) {
                        setFocusedChipIndex(currentValue.length - 1);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setFocusedChipIndex(-1);
                    inputRef.current?.focus();
                    break;
            }
        };

        const resolvedSize = getResolvedSize({ ...baseProps });
        const containerClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames('eui-chips', `eui-chips-${resolvedSize}`, {
                'eui-chips-readonly': readonly,
                'eui-chips-disabled': disabled,
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;

        const rovingTabIndex = (i: number) => {
            if (focusedChipIndex >= 0) return focusedChipIndex === i ? 0 : -1;
            // input is the default focus target; chips remain reachable via Backspace/ArrowLeft
            return -1;
        };

        return (
            <div
                {...nativeProps}
                ref={ref}
                id={inputId}
                className={classNames(containerClasses, className)}
                style={{ ...nativeProps.style, ...componentStyles }}
                onClick={(e) => {
                    nativeProps.onClick?.(e);
                    if ((e.target as HTMLElement).closest('.eui-chips-item')) return;
                    inputRef.current?.focus();
                }}
            >
                <ul className="eui-chips-list" role="list" aria-label={ariaLabel || 'Selected items'}>
                    {currentValue.map((chip, index) => (
                        <li
                            key={index}
                            ref={(el) => {
                                chipRefs.current[index] = el;
                            }}
                            role="listitem"
                            className={classNames('eui-chips-item', {
                                'eui-chips-item-focused': focusedChipIndex === index,
                            })}
                            tabIndex={rovingTabIndex(index)}
                            onKeyDown={(e) => handleChipKeyDown(e, index)}
                            onFocus={() => setFocusedChipIndex(index)}
                        >
                            <span className="eui-chips-item-label">{chip}</span>
                            {!readonly && !disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeChip(index);
                                    }}
                                    className="eui-chips-item-remove"
                                    aria-label={`Remove ${chip}`}
                                    tabIndex={-1}
                                >
                                    <TimesIcon />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                {!readonly && (!maxItems || currentValue.length < maxItems) && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        onFocus={() => setFocusedChipIndex(-1)}
                        placeholder={currentValue.length === 0 ? placeholder : ''}
                        disabled={disabled}
                        aria-label={ariaLabel || placeholder}
                        className="eui-chips-input"
                    />
                )}
                <input type="hidden" name={name} value={currentValue.join(separator)} />
            </div>
        );
    },
);
