import classNames from 'classnames';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { TimesIcon } from '../assets/icons';
import { useDebounce } from '../hooks';
import { BaseComponentProps, ComponentEvent, ListItem } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize } from '../utils';
import './AutocompleteMulti.scss';
import { Checkbox } from './Checkbox';
import { Popover } from './Popover';

interface AutocompleteMultiProps<T = any> extends BaseComponentProps {
    items: ListItem[];
    value?: T[];
    onChange?: (event: ComponentEvent<T[]>) => void;
    onFilter?: (query: string) => void | Promise<void>;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    debounceMs?: number;
    minLength?: number;
    maxSelectedItems?: number;
    loading?: boolean;
    emptyMessage?: string;
    renderItem?: (item: ListItem, index: number, isSelected: boolean, isHighlighted: boolean) => React.ReactNode;
    renderSelectedTemplate?: (selectedItems: ListItem[], onRemove: (value: T) => void) => React.ReactNode;
    showCount?: boolean;
    autoFocus?: boolean;
    id?: string;
    maxSelections?: number;
}

export const AutocompleteMulti = forwardRef<HTMLDivElement, AutocompleteMultiProps>(
    (
        {
            items,
            value = [],
            onChange,
            onFilter,
            placeholder = 'Type to search and select...',
            required = false,
            readonly = false,
            debounceMs = 300,
            minLength = 1,
            maxSelectedItems,
            loading = false,
            emptyMessage = 'No results found',
            renderItem,
            renderSelectedTemplate,
            showCount = false,
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
        const [inputValue, setInputValue] = useState('');
        const [isFocused, setIsFocused] = useState(false);
        const containerRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const combinedRef = (ref as React.RefObject<HTMLDivElement>) || containerRef;

        const debouncedValue = useDebounce(inputValue, debounceMs);
        const selectedItems = items.filter((item) => value.includes(item.value));

        useEffect(() => {
            if (debouncedValue.length >= minLength && onFilter) {
                onFilter(debouncedValue);
            }
        }, [debouncedValue, minLength, onFilter]);

        useEffect(() => {
            if (isFocused && inputValue.length >= minLength && items.length > 0) {
                setIsOpen(true);
            }
        }, [isFocused, inputValue.length, minLength, items.length]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
        };

        const handleSelect = (item: ListItem) => {
            if (item.disabled) return;
            if (maxSelectedItems && value.length >= maxSelectedItems) return;

            const isAlreadySelected = value.includes(item.value);
            const newValue = isAlreadySelected ? value.filter((v) => v !== item.value) : [...value, item.value];

            if (onChange) {
                onChange({
                    event: { target: { value: newValue } } as any,
                    value: newValue,
                    name,
                    args,
                });
            }
        };

        const handleDone = () => {
            setIsOpen(false);
            setIsFocused(false);
            setInputValue('');
        };

        const handleRemove = (itemValue: any) => {
            const newValue = value.filter((v) => v !== itemValue);
            if (onChange) {
                onChange({
                    event: { target: { value: newValue } } as any,
                    value: newValue,
                    name,
                    args,
                });
            }
        };

        const handleFocus = () => {
            setIsFocused(true);
        };

        const handleClose = () => {
            setIsOpen(false);
            setIsFocused(false);
            setInputValue('');
        };

        const handleContainerClick = () => {
            inputRef.current?.focus();
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace' && !inputValue && selectedItems.length > 0) {
                e.preventDefault();
                handleRemove(selectedItems[selectedItems.length - 1].value);
            }
        };

        const defaultRenderSelectedTemplate = (items: ListItem[], onRemove: (value: any) => void) => {
            if (showCount && items.length > 3) {
                return (
                    <span className="eui-autocomplete-multi-count-tag">
                        {items.length} items selected
                        {!readonly && !disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onChange) {
                                        onChange({
                                            event: e as any,
                                            value: [],
                                            name,
                                            args,
                                        });
                                    }
                                }}
                                className="eui-autocomplete-multi-count-remove"
                                aria-label="Clear all selections"
                            >
                                <TimesIcon />
                            </button>
                        )}
                    </span>
                );
            }

            return (
                <>
                    {items.map((item, index) => (
                        <span key={index} className="eui-autocomplete-multi-tag">
                            <span className="eui-autocomplete-multi-tag-label">{item.label}</span>
                            {!readonly && !disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(item.value);
                                    }}
                                    className="eui-autocomplete-multi-tag-remove"
                                    aria-label={`Remove ${item.label}`}
                                >
                                    <TimesIcon />
                                </button>
                            )}
                        </span>
                    ))}
                </>
            );
        };

        const resolvedSize = getResolvedSize({ ...baseProps });
        const containerClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames('eui-autocomplete-multi', `eui-autocomplete-multi-${resolvedSize}`, {
                'eui-autocomplete-multi-readonly': readonly,
                'eui-autocomplete-multi-disabled': disabled,
            }),
        );

        const componentStyles = { ...getComponentStyles({ ...baseProps, disabled }), padding: undefined, height: undefined, fontSize: undefined };

        return (
            <>
                <div
                    ref={combinedRef}
                    id={inputId}
                    className={classNames(containerClasses, className)}
                    style={componentStyles}
                    onClick={handleContainerClick}
                >
                    <div className="eui-autocomplete-multi-inner">
                        {selectedItems.length > 0 && (
                            <div className="eui-autocomplete-multi-tags">
                                {renderSelectedTemplate
                                    ? renderSelectedTemplate(selectedItems, handleRemove)
                                    : defaultRenderSelectedTemplate(selectedItems, handleRemove)}
                            </div>
                        )}
                        {!readonly && (!maxSelectedItems || value.length < maxSelectedItems) && (
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onFocus={handleFocus}
                                onKeyDown={handleKeyDown}
                                placeholder={selectedItems.length === 0 ? placeholder : ''}
                                disabled={disabled}
                                autoFocus={autoFocus}
                                className="eui-autocomplete-multi-input"
                                aria-autocomplete="list"
                                aria-expanded={isOpen}
                                aria-haspopup="listbox"
                                role="combobox"
                            />
                        )}
                    </div>
                    <input type="hidden" name={name} value={value.join(',')} required={required} />
                </div>

                {isOpen && (
                    <Popover
                        isOpen={isOpen}
                        onClose={handleClose}
                        triggerElement={combinedRef.current}
                        items={items}
                        onSelect={handleSelect}
                        selectedIndex={-1}
                        renderItem={(item, index, _isSelected, isHighlighted) => {
                            const isItemSelected = value.includes(item.value);
                            if (renderItem) {
                                return renderItem(item, index, isItemSelected, isHighlighted);
                            }
                            return (
                                <div
                                    className={classNames('eui-autocomplete-multi-option', {
                                        'eui-autocomplete-multi-option-highlighted': isHighlighted,
                                        'eui-autocomplete-multi-option-disabled': item.disabled,
                                    })}
                                    onClick={() => !item.disabled && handleSelect(item)}
                                >
                                    <Checkbox checked={isItemSelected} disabled={item.disabled} onChange={() => handleSelect(item)} />
                                    <span className="eui-autocomplete-multi-option-label">{item.label}</span>
                                </div>
                            );
                        }}
                        filter={inputValue}
                        loading={loading}
                        emptyMessage={emptyMessage}
                        mobileTitle={placeholder}
                        mobileSearch={{
                            value: inputValue,
                            onChange: setInputValue,
                            placeholder,
                        }}
                        footer={
                            <button type="button" className="eui-autocomplete-multi-done" onClick={handleDone}>
                                Done {value.length > 0 ? `(${value.length})` : ''}
                            </button>
                        }
                        {...baseProps}
                    />
                )}
            </>
        );
    },
);
