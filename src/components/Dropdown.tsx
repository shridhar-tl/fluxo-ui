import classNames from 'classnames';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon } from '../assets/icons';
import { BaseComponentProps, ComponentEvent, ListItem, ListItemGroup } from '../types';
import { generateId, getComponentClasses, getComponentStyles, getResolvedSize } from '../utils';
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

interface DropdownProps<T = any> extends BaseComponentProps {
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
            ...baseProps
        },
        ref,
    ) => {
        const [inputId] = useState(id || generateId());
        const [isOpen, setIsOpen] = useState(false);
        const [filterValue, setFilterValue] = useState('');
        const [internalValue, setInternalValue] = useState<any>(undefined);
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

        const selectedItem = flatItems.find((item) => item.value === currentValue) || null;
        const selectedIndex = selectedItem ? flatItems.findIndex((item) => item.value === currentValue) : -1;

        const handleSelect = (item: ListItem) => {
            if (!isControlled) {
                setInternalValue(item.value);
            }
            onChange?.({
                event: { target: { value: item.value } } as any,
                value: item.value,
                name,
                args,
            });
            setIsOpen(false);
            setFilterValue('');
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
            if (e?.target && combinedRef.current.contains(e?.target as Node)) {
                return;
            }

            setIsOpen(false);
            setFilterValue('');
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
                    ref={combinedRef}
                    id={inputId}
                    type="button"
                    onClick={handleToggle}
                    disabled={disabled}
                    className={classNames(triggerClasses, className)}
                    style={componentStyles}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-required={required}
                >
                    <div className="eui-dropdown-value">{renderValue ? renderValue(selectedItem) : defaultRenderValue(selectedItem)}</div>
                    <ChevronDownIcon className={classNames('eui-dropdown-chevron', { 'eui-dropdown-chevron-open': isOpen })} />
                </button>

                <Popover
                    isOpen={isOpen}
                    onClose={handleClose}
                    triggerElement={combinedRef.current}
                    items={flatItems}
                    groups={groups}
                    onSelect={handleSelect}
                    selectedIndex={selectedIndex}
                    renderItem={renderItem}
                    filter={searchable ? filterValue : ''}
                    loading={loading}
                    emptyMessage={emptyMessage}
                    mobileTitle={placeholder}
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
