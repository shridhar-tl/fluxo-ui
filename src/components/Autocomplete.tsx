import classNames from 'classnames';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useDebounce, useViewport } from '../hooks';
import { BaseComponentProps, ComponentEvent, ListItem } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize } from '../utils';
import './Autocomplete.scss';
import { Popover } from './Popover';

interface AutocompleteProps extends BaseComponentProps {
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
            ...baseProps
        },
        ref,
    ) => {
        const [inputId] = useState(id || generateId());
        const [isOpen, setIsOpen] = useState(false);
        const [isFocused, setIsFocused] = useState(false);
        const [internalValue, setInternalValue] = useState('');
        const inputRef = useRef<HTMLInputElement>(null);
        const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;
        const { isCompact } = useViewport();

        const isControlled = value !== undefined;
        const currentValue = isControlled ? value : internalValue;

        const debouncedValue = useDebounce(currentValue, debounceMs);
        const selectedItem = items.find((item) => item.value === selectedValue) || null;
        const selectedIndex = selectedItem ? items.findIndex((item) => item.value === selectedValue) : -1;

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

        const handleSelect = (item: ListItem) => {
            if (!isControlled) {
                setInternalValue(item.label);
            }
            onSelect?.({
                event: { target: { value: item.value } } as any,
                value: item.value,
                name,
                args,
            });
            onChange?.({
                event: { target: { value: item.label } } as any,
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
                event: { target: { value: newValue } } as any,
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
                    ref={combinedRef}
                    id={inputId}
                    type="text"
                    value={currentValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    readOnly={readonly}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    className={classNames(inputClasses, className)}
                    style={componentStyles}
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    role="combobox"
                />

                {isOpen && (
                    <Popover
                        isOpen={isOpen}
                        onClose={handleClose}
                        triggerElement={combinedRef.current}
                        items={items}
                        onSelect={handleSelect}
                        selectedIndex={selectedIndex}
                        renderItem={renderItem}
                        filter={currentValue}
                        loading={loading}
                        emptyMessage={emptyMessage}
                        mobileTitle={placeholder}
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
