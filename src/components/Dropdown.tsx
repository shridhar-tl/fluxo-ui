import classNames from 'classnames';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon } from '../assets/icons';
import { BaseComponentProps, ComponentEvent, ListItem, ListItemGroup } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize, splitBaseAndNativeProps } from '../utils';
import './eui-base.scss';
import './Dropdown.scss';
import { Popover } from './Popover';

const isGroupedOptions = (options: ListItem[] | ListItemGroup[]): options is ListItemGroup[] => {
    return options.length > 0 && 'items' in options[0];
};

const normalizeItem = (item: ListItem, optionLabel: string, optionValue: string): ListItem => {
    if (optionLabel === 'label' && optionValue === 'value') return item;
    return { ...item, label: item[optionLabel], value: item[optionValue] };
};

const normalizeOptions = (
    options: ListItem[] | ListItemGroup[],
    optionLabel: string,
    optionValue: string,
): { flatItems: ListItem[]; groups: ListItemGroup[] | undefined } => {
    if (isGroupedOptions(options)) {
        const normalizedGroups = options.map((group) => ({
            ...group,
            items: group.items.map((item) => normalizeItem(item, optionLabel, optionValue)),
        }));
        return {
            flatItems: normalizedGroups.flatMap((g) => g.items),
            groups: normalizedGroups,
        };
    }
    const flatItems = options.map((item) => normalizeItem(item, optionLabel, optionValue));
    return { flatItems, groups: undefined };
};

interface DropdownProps<T = any> extends BaseComponentProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'size' | 'value' | 'type'> {
    options: ListItem[] | ListItemGroup[];
    value?: T;
    onChange?: (event: ComponentEvent<T>) => void;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    searchable?: boolean;
    loading?: boolean;
    emptyMessage?: string;
    renderItem?: (item: ListItem, index: number, isSelected: boolean, isHighlighted: boolean) => React.ReactNode;
    renderValue?: (item: ListItem | null) => React.ReactNode;
    id?: string;
    showClear?: boolean;
    readOnly?: boolean;
    optionLabel?: string;
    optionValue?: string;
    compareFn?: (a: any, b: any) => boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
}

export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
    (
        {
            options,
            value,
            onChange,
            placeholder = 'Select an option',
            required = false,
            readonly = false,
            searchable = false,
            loading = false,
            emptyMessage = 'No options available',
            renderItem,
            renderValue,
            id,
            disabled = false,
            className,
            name,
            args,
            optionLabel = 'label',
            optionValue = 'value',
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
        const [filterValue, setFilterValue] = useState('');
        const [internalValue, setInternalValue] = useState<any>(undefined);
        const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
        const triggerRef = useRef<HTMLButtonElement>(null);
        const filterInputRef = useRef<HTMLInputElement>(null);
        const combinedRef = (ref as React.RefObject<HTMLButtonElement>) || triggerRef;

        useEffect(() => {
            if (isOpen && searchable) {
                setTimeout(() => filterInputRef.current?.focus(), 50);
            }
        }, [isOpen, searchable]);

        const isControlled = value !== undefined;
        const currentValue = isControlled ? value : internalValue;

        const { flatItems, groups } = useMemo(
            () => normalizeOptions(options, optionLabel, optionValue),
            [options, optionLabel, optionValue],
        );

        const compare = useCallback(
            (a: any, b: any) => {
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
            },
            [compareFn],
        );

        const selectedItem = flatItems.find((item) => compare(item.value, currentValue)) || null;
        const selectedIndex = selectedItem ? flatItems.findIndex((item) => compare(item.value, currentValue)) : -1;

        const handleSelect = (item: ListItem, e?: React.SyntheticEvent) => {
            if (!isControlled) {
                setInternalValue(item.value);
            }
            onChange?.({
                event: e,
                value: item.value,
                name,
                args,
            });
            setIsOpen(false);
            setFilterValue('');
            requestAnimationFrame(() => combinedRef.current?.focus());
        };

        const openDropdown = () => {
            if (!disabled && !readonly && !isOpen) {
                setIsOpen(true);
                setFilterValue('');
            }
        };

        const handleToggle = () => {
            if (!disabled && !readonly) {
                setIsOpen(!isOpen);
                if (!isOpen) {
                    setFilterValue('');
                }
            }
        };

        const handleClose = (e?: MouseEvent) => {
            if (e?.target && combinedRef.current?.contains(e?.target as Node)) {
                return;
            }

            setIsOpen(false);
            setFilterValue('');
        };

        const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (disabled || readonly) return;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                openDropdown();
                return;
            }
            if (e.key === 'Home' || e.key === 'End') {
                e.preventDefault();
                openDropdown();
                return;
            }
            if (!isOpen && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const ch = e.key.toLowerCase();
                const match = flatItems.find((it) => !it.disabled && it.label.toLowerCase().startsWith(ch));
                if (match) {
                    e.preventDefault();
                    handleSelect(match, e);
                }
            }
        };

        const resolvedSize = getResolvedSize({ ...baseProps });
        const triggerClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames('eui-dropdown', `eui-dropdown-${resolvedSize}`, {
                'eui-dropdown-readonly': readonly,
                'eui-dropdown-disabled': disabled,
                'eui-dropdown-open': isOpen,
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;
        delete componentStyles.fontSize;

        const defaultRenderValue = (item: ListItem | null) => {
            if (!item) {
                return <span className="eui-dropdown-placeholder">{placeholder}</span>;
            }
            return <span>{item.label}</span>;
        };

        return (
            <>
                <button
                    {...nativeProps}
                    ref={combinedRef}
                    id={inputId}
                    type="button"
                    onClick={(e) => {
                        nativeProps.onClick?.(e);
                        handleToggle();
                    }}
                    onKeyDown={(e) => {
                        nativeProps.onKeyDown?.(e);
                        handleTriggerKeyDown(e);
                    }}
                    disabled={disabled}
                    className={classNames(triggerClasses, className)}
                    style={{ ...nativeProps.style, ...componentStyles }}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? listboxId : undefined}
                    aria-activedescendant={isOpen ? activeOptionId ?? undefined : undefined}
                    aria-required={required}
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                >
                    <div className="eui-dropdown-value">{renderValue ? renderValue(selectedItem) : defaultRenderValue(selectedItem)}</div>
                    <ChevronDownIcon className={classNames('eui-dropdown-chevron', { 'eui-dropdown-chevron-open': isOpen })} aria-hidden="true" />
                </button>

                <Popover
                    isOpen={isOpen}
                    onClose={handleClose}
                    triggerElement={combinedRef.current}
                    items={flatItems}
                    groups={groups}
                    onSelect={(item) => handleSelect(item)}
                    selectedIndex={selectedIndex}
                    renderItem={renderItem}
                    filter={searchable ? filterValue : ''}
                    loading={loading}
                    emptyMessage={emptyMessage}
                    mobileTitle={placeholder}
                    listboxId={listboxId}
                    onHighlightChange={(_, optionId) => setActiveOptionId(optionId)}
                    mobileSearch={
                        searchable
                            ? {
                                  value: filterValue,
                                  onChange: setFilterValue,
                                  placeholder: 'Search...',
                              }
                            : undefined
                    }
                    hideChildrenOnMobile
                    {...baseProps}
                >
                    {searchable && (
                        <div className="eui-dropdown-filter-wrap">
                            <input
                                ref={filterInputRef}
                                type="text"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Search..."
                                className="eui-dropdown-filter-input"
                                aria-label="Filter options"
                                aria-controls={listboxId}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                </Popover>

                <input type="hidden" name={name} value={selectedItem?.value?.toString() || ''} required={required} />
            </>
        );
    },
);
