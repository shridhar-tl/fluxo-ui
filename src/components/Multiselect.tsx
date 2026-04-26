import classNames from 'classnames';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon, TimesIcon } from '../assets/icons';
import { useDebounce } from '../hooks';
import { BaseComponentProps, ComponentEvent, ListItem, ListItemGroup } from '../types';
import { filterItems, generateId, getComponentClasses, getComponentStyles, getResolvedSize } from '../utils';
import { Checkbox } from './Checkbox';
import Icon from './Icon';
import './Multiselect.scss';
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
): { flatItems: ListItem[]; groups: ListItemGroup[] | undefined; grouped: boolean } => {
    if (isGroupedOptions(options)) {
        const normalizedGroups = options.map((group) => ({
            ...group,
            items: group.items.map((item) => normalizeItem(item, optionLabel, optionValue)),
        }));
        return {
            flatItems: normalizedGroups.flatMap((g) => g.items),
            groups: normalizedGroups,
            grouped: true,
        };
    }
    const flatItems = options.map((item) => normalizeItem(item, optionLabel, optionValue));
    return { flatItems, groups: undefined, grouped: false };
};

interface MultiselectProps<T = any> extends BaseComponentProps {
    options: ListItem[] | ListItemGroup[];
    value?: T[];
    onChange?: (event: ComponentEvent<T[]>) => void;
    onFilter?: (query: string) => void | Promise<void>;
    placeholder?: string;
    required?: boolean;
    readonly?: boolean;
    searchable?: boolean;
    debounceMs?: number;
    maxSelectedItems?: number;
    loading?: boolean;
    emptyMessage?: string;
    renderItem?: (item: ListItem, index: number, isSelected: boolean, isHighlighted: boolean) => React.ReactNode;
    renderSelectedItem?: (item: ListItem, onRemove: () => void) => React.ReactNode;
    showSelectAll?: boolean;
    id?: string;
    maxSelections?: number;
    optionLabel?: string;
    optionValue?: string;
}

export const Multiselect = forwardRef<HTMLDivElement, MultiselectProps>(
    (
        {
            options,
            value,
            onChange,
            onFilter,
            placeholder = 'Select items...',
            required = false,
            readonly = false,
            searchable = true,
            debounceMs = 300,
            maxSelectedItems,
            loading = false,
            emptyMessage = 'No items available',
            renderItem,
            renderSelectedItem,
            showSelectAll = true,
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
        const [internalValue, setInternalValue] = useState<any[]>([]);
        const triggerRef = useRef<HTMLDivElement>(null);
        const filterInputRef = useRef<HTMLInputElement>(null);
        const combinedRef = (ref as React.RefObject<HTMLDivElement>) || triggerRef;

        const isControlled = value !== undefined;
        const currentValue = isControlled ? value : internalValue;

        const debouncedFilter = useDebounce(filterValue, debounceMs);

        const { flatItems, groups, grouped } = useMemo(
            () => normalizeOptions(options, optionLabel, optionValue),
            [options, optionLabel, optionValue],
        );

        const selectedItems = flatItems.filter((item) => currentValue.includes(item.value));
        const availableItems = searchable && !onFilter ? filterItems(flatItems, filterValue) : flatItems;
        const allSelected = flatItems.length > 0 && flatItems.every((item) => currentValue.includes(item.value));
        const someSelected = currentValue.length > 0 && currentValue.length < flatItems.length;

        const filteredGroups = useMemo(() => {
            if (!grouped || !groups || !searchable || onFilter) return undefined;
            return groups
                .map((group) => ({
                    ...group,
                    items: group.items.filter((item) => !filterValue || item.label.toLowerCase().includes(filterValue.toLowerCase())),
                }))
                .filter((group) => group.items.length > 0);
        }, [grouped, groups, filterValue, searchable, onFilter]);

        useEffect(() => {
            if (debouncedFilter && onFilter) {
                onFilter(debouncedFilter);
            }
        }, [debouncedFilter, onFilter]);

        const handleToggle = () => {
            if (!disabled && !readonly) {
                setIsOpen(!isOpen);
                if (!isOpen) {
                    setFilterValue('');
                    setTimeout(() => filterInputRef.current?.focus(), 100);
                }
            }
        };

        const handleClose = () => {
            setIsOpen(false);
            setFilterValue('');
        };

        const emitChange = (newValue: any[]) => {
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

        const handleItemSelect = (item: ListItem) => {
            if (item.disabled) return;

            let newValue: any[];
            if (currentValue.includes(item.value)) {
                newValue = currentValue.filter((v) => v !== item.value);
            } else {
                if (maxSelectedItems && currentValue.length >= maxSelectedItems) return;
                newValue = [...currentValue, item.value];
            }

            emitChange(newValue);
        };

        const handleSelectAll = () => {
            const newValue = allSelected ? [] : flatItems.filter((item) => !item.disabled).map((item) => item.value);
            emitChange(newValue);
        };

        const handleRemoveItem = (itemValue: any) => {
            const newValue = currentValue.filter((v) => v !== itemValue);
            emitChange(newValue);
        };

        const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFilterValue(e.target.value);
        };

        const customRenderItem = (item: ListItem, _index: number, isSelected: boolean, isHighlighted: boolean) => (
            <div
                className={classNames('eui-multiselect-item', {
                    'eui-multiselect-item-highlighted': isHighlighted,
                    'eui-multiselect-item-disabled': item.disabled,
                })}
                onClick={() => !item.disabled && handleItemSelect(item)}
            >
                <Checkbox checked={isSelected} disabled={item.disabled} onChange={() => handleItemSelect(item)} />
                {!!item.icon && <Icon icon={item.icon} className="eui-multiselect-item-icon" />}
                <span className="eui-multiselect-item-label">{item.label}</span>
            </div>
        );

        const defaultRenderSelectedItem = (item: ListItem, onRemove: () => void) => (
            <span className="eui-multiselect-tag">
                <span className="eui-multiselect-tag-label">{item.label}</span>
                {!readonly && !disabled && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="eui-multiselect-tag-remove"
                        aria-label={`Remove ${item.label}`}
                    >
                        <TimesIcon />
                    </button>
                )}
            </span>
        );

        const resolvedSize = getResolvedSize({ ...baseProps });
        const triggerClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames('eui-multiselect', `eui-multiselect-${resolvedSize}`, {
                'eui-multiselect-readonly': readonly,
                'eui-multiselect-disabled': disabled,
                'eui-multiselect-open': isOpen,
            }),
        );

        const componentStyles = getComponentStyles({ ...baseProps, disabled });
        delete componentStyles.padding;
        delete componentStyles.height;

        return (
            <>
                <div
                    ref={combinedRef}
                    id={inputId}
                    className={classNames(triggerClasses, className)}
                    style={componentStyles}
                    onClick={handleToggle}
                    tabIndex={disabled ? -1 : 0}
                    role="button"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <div className="eui-multiselect-inner">
                        <div className="eui-multiselect-tags">
                            {selectedItems.length === 0 ? (
                                <span className="eui-multiselect-placeholder">{placeholder}</span>
                            ) : (
                                selectedItems.map((item, index) => (
                                    <span key={index}>
                                        {renderSelectedItem
                                            ? renderSelectedItem(item, () => handleRemoveItem(item.value))
                                            : defaultRenderSelectedItem(item, () => handleRemoveItem(item.value))}
                                    </span>
                                ))
                            )}
                        </div>
                        <ChevronDownIcon
                            className={classNames('eui-multiselect-chevron', {
                                'eui-multiselect-chevron-open': isOpen,
                            })}
                        />
                    </div>
                </div>

                <Popover
                    isOpen={isOpen}
                    onClose={handleClose}
                    triggerElement={combinedRef.current}
                    items={[
                        ...(showSelectAll
                            ? [
                                  {
                                      value: 'select-all' as any,
                                      label: allSelected ? 'Deselect All' : 'Select All',
                                      disabled: false,
                                  },
                              ]
                            : []),
                        ...availableItems,
                    ]}
                    groups={grouped && !showSelectAll ? filteredGroups : undefined}
                    onSelect={(item) => {
                        if (item.value === 'select-all') {
                            handleSelectAll();
                        } else {
                            handleItemSelect(item);
                        }
                    }}
                    selectedIndex={-1}
                    renderItem={(item, index, _isSelected, isHighlighted) => {
                        if (item.value === 'select-all') {
                            return (
                                <div
                                    className={classNames('eui-multiselect-item eui-multiselect-item-select-all', {
                                        'eui-multiselect-item-highlighted': isHighlighted,
                                    })}
                                    onClick={handleSelectAll}
                                >
                                    <Checkbox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll} />
                                    <span className="eui-multiselect-item-label">{item.label}</span>
                                </div>
                            );
                        }

                        const actualItem = availableItems[index - (showSelectAll ? 1 : 0)];
                        const actualIsSelected = currentValue.includes(actualItem.value);

                        return renderItem
                            ? renderItem(actualItem, index, actualIsSelected, isHighlighted)
                            : customRenderItem(actualItem, index, actualIsSelected, isHighlighted);
                    }}
                    filter=""
                    loading={loading}
                    emptyMessage={emptyMessage}
                    mobileTitle={placeholder}
                    mobileSearch={
                        searchable
                            ? {
                                  value: filterValue,
                                  onChange: setFilterValue,
                                  placeholder: 'Filter items...',
                              }
                            : undefined
                    }
                    hideChildrenOnMobile
                    {...baseProps}
                >
                    {searchable && (
                        <div className="eui-multiselect-filter-wrap">
                            <input
                                ref={filterInputRef}
                                type="text"
                                value={filterValue}
                                onChange={handleFilterChange}
                                placeholder="Filter items..."
                                className="eui-multiselect-filter-input"
                            />
                        </div>
                    )}
                </Popover>

                <input type="hidden" name={name} value={currentValue.join(',')} required={required} />
            </>
        );
    },
);
