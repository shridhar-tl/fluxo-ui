import classNames from 'classnames';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useDebounce, useViewport } from '../hooks';
import { BaseComponentProps, ComponentEvent, ListItem } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize, splitBaseAndNativeProps } from '../utils';
import './eui-base.scss';
import './Autocomplete.scss';
import { Popover } from './Popover';

interface AutocompleteProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'value' | 'type' | 'onSelect'> {
    items: ListItem[];
    value?: string;
    selectedValue?: any;
    onChange?: (event: ComponentEvent<string>) => void;
    onSelect?: (event: ComponentEvent<any>) => void;
    onFilter?: (query: string) => void | Promise<void>;
    maxSuggestions?: number;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    debounceMs?: number;
    minLength?: number;
    loading?: boolean;
    emptyMessage?: string;
    renderItem?: (item: ListItem, index: number, isSelected: boolean, isHighlighted: boolean) => React.ReactNode;
    autoFocus?: boolean;
    compareFn?: (a: any, b: any) => boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
}

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
    (
        {
            items,
            value,
            selectedValue,
            onChange,
            onSelect,
            onFilter,
            placeholder = 'Type to search...',
            required = false,
            readonly = false,
            debounceMs = 300,
            minLength = 1,
            loading = false,
            emptyMessage = 'No results found',
            renderItem,
            autoFocus = false,
            id,
            disabled = false,
            className,
            name,
            args,
            compareFn,
            ariaLabel,
            ariaLabelledBy,
            ...rest
        },
        ref,
    ) => {
        const { styleProps: baseProps, nativeProps } = splitBaseAndNativeProps(rest);
        const [inputId] = useState(id || generateId());
        const listboxId = `${inputId}-listbox`;
        const [isOpen, setIsOpen] = useState(false);
        const [isFocused, setIsFocused] = useState(false);
        const [internalValue, setInternalValue] = useState('');
        const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;
        const { isCompact } = useViewport();

        const isControlled = value !== undefined;
        const currentValue = isControlled ? value : internalValue;

        const compare = (a: any, b: any) => {
            if (compareFn) return compareFn(a, b);
            if (a === b) return true;
            if (a == null || b == null) return false;
            if (typeof a === 'object' && typeof b === 'object') {
                try {
                    return JSON.stringify(a) === JSON.stringify(b);
                } catch {
                    return false;
                }
            }
            return false;
        };

        const debouncedValue = useDebounce(currentValue, debounceMs);
        const selectedItem = items.find((item) => compare(item.value, selectedValue)) || null;
        const selectedIndex = selectedItem ? items.findIndex((item) => compare(item.value, selectedValue)) : -1;

        useEffect(() => {
            if (debouncedValue.length >= minLength && onFilter) {
                onFilter(debouncedValue);
            }
        }, [debouncedValue, minLength, onFilter]);

        useEffect(() => {
            const shouldOpen = isFocused && currentValue.length >= minLength && items.length > 0;
            setIsOpen(shouldOpen);
        }, [isFocused, currentValue.length, minLength, items.length]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.({
                event: e,
                value: newValue,
                name,
                args,
            });
        };

        const handleSelect = (item: ListItem, e?: React.SyntheticEvent) => {
            if (!isControlled) {
                setInternalValue(item.label);
            }
            onSelect?.({
                event: e,
                value: item.value,
                name,
                args,
            });
            onChange?.({
                event: e,
                value: item.label,
                name,
                args,
            });
            setIsFocused(false);
            setIsOpen(false);
            combinedRef.current?.blur();
        };

        const handleFocus = () => {
            setIsFocused(true);
        };

        const handleBlur = () => {
            if (isCompact) return;
            setTimeout(() => {
                setIsFocused(false);
                setIsOpen(false);
            }, 200);
        };

        const handleClose = () => {
            setIsOpen(false);
            setIsFocused(false);
        };

        const handleMobileSearchChange = (newValue: string) => {
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onChange?.({
                event: undefined,
                value: newValue,
                name,
                args,
            });
        };

        const resolvedSize = getResolvedSize({ ...baseProps });
        const inputClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames('eui-autocomplete', `eui-autocomplete-${resolvedSize}`, {
                'eui-autocomplete-readonly': readonly,
                'eui-autocomplete-disabled': disabled,
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;
        delete componentStyles.fontSize;

        return (
            <>
                <input
                    {...nativeProps}
                    ref={combinedRef}
                    id={inputId}
                    type="text"
                    value={currentValue}
                    onChange={(e) => {
                        nativeProps.onChange?.(e);
                        handleInputChange(e);
                    }}
                    onFocus={(e) => {
                        nativeProps.onFocus?.(e);
                        handleFocus();
                    }}
                    onBlur={(e) => {
                        nativeProps.onBlur?.(e);
                        handleBlur();
                    }}
                    placeholder={placeholder}
                    required={required}
                    readOnly={readonly}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    className={classNames(inputClasses, className)}
                    style={{ ...nativeProps.style, ...componentStyles }}
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={isOpen ? listboxId : undefined}
                    aria-activedescendant={isOpen ? activeOptionId ?? undefined : undefined}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    role="combobox"
                />

                {isOpen && (
                    <Popover
                        isOpen={isOpen}
                        onClose={handleClose}
                        triggerElement={combinedRef.current}
                        items={items}
                        onSelect={(item) => handleSelect(item)}
                        selectedIndex={selectedIndex}
                        renderItem={renderItem}
                        filter={currentValue}
                        loading={loading}
                        emptyMessage={emptyMessage}
                        mobileTitle={placeholder}
                        listboxId={listboxId}
                        onHighlightChange={(_, optionId) => setActiveOptionId(optionId)}
                        mobileSearch={{
                            value: currentValue,
                            onChange: handleMobileSearchChange,
                            placeholder,
                        }}
                        {...baseProps}
                    />
                )}

                <input type="hidden" name={name} value={selectedValue?.toString() || ''} required={required} />
            </>
        );
    },
);
