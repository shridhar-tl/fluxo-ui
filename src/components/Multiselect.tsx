import classNames from 'classnames';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon, TimesIcon } from '../assets/icons';
import { useDebounce } from '../hooks';
import { BaseComponentProps, ComponentEvent, ListItem, ListItemGroup } from '../types';
import { filterItems, generateId, getComponentClasses, getComponentStyles, getResolvedSize, splitBaseAndNativeProps } from '../utils';
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

interface MultiselectProps<T = any> extends BaseComponentProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
    compareFn?: (a: any, b: any) => boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
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
        const [internalValue, setInternalValue] = useState<any[]>([]);
        const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
        const [maxReachedAnnouncement, setMaxReachedAnnouncement] = useState('');
        const wrapRef = useRef<HTMLDivElement>(null);
        const triggerButtonRef = useRef<HTMLButtonElement>(null);
        const filterInputRef = useRef<HTMLInputElement>(null);
        const combinedRef = (ref as React.RefObject<HTMLDivElement>) || wrapRef;

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

        const isControlled = value !== undefined;
        const currentValue = isControlled ? value : internalValue;

        const debouncedFilter = useDebounce(filterValue, debounceMs);

        const { flatItems, groups, grouped } = useMemo(
            () => normalizeOptions(options, optionLabel, optionValue),
            [options, optionLabel, optionValue],
        );

        const selectedItems = flatItems.filter((item) => currentValue.some((v) => compare(v, item.value)));
        const availableItems = searchable && !onFilter ? filterItems(flatItems, filterValue) : flatItems;
        const allSelected = flatItems.length > 0 && flatItems.every((item) => currentValue.some((v) => compare(v, item.value)));
        const someSelected = currentValue.length > 0 && currentValue.length < flatItems.length;
        const isMaxReached = !!maxSelectedItems && currentValue.length >= maxSelectedItems;

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

        const emitChange = (newValue: any[], e?: React.SyntheticEvent) => {
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

        const handleItemSelect = (item: ListItem, e?: React.SyntheticEvent) => {
            if (item.disabled) return;

            let newValue: any[];
            const isSel = currentValue.some((v) => compare(v, item.value));
            if (isSel) {
                newValue = currentValue.filter((v) => !compare(v, item.value));
            } else {
                if (isMaxReached) {
                    setMaxReachedAnnouncement(`Maximum of ${maxSelectedItems} items selected`);
                    window.setTimeout(() => setMaxReachedAnnouncement(''), 1500);
                    return;
                }
                newValue = [...currentValue, item.value];
            }

            emitChange(newValue, e);
        };

        const handleSelectAll = (e?: React.SyntheticEvent) => {
            const newValue = allSelected ? [] : flatItems.filter((item) => !item.disabled).map((item) => item.value);
            emitChange(newValue, e);
        };

        const handleRemoveItem = (itemValue: any, e?: React.SyntheticEvent) => {
            const newValue = currentValue.filter((v) => !compare(v, itemValue));
            emitChange(newValue, e);
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
                onClick={(e) => !item.disabled && handleItemSelect(item, e)}
            >
                <Checkbox checked={isSelected} disabled={item.disabled} onChange={(ev) => handleItemSelect(item, ev?.event as React.SyntheticEvent | undefined)} />
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

        const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (disabled || readonly) return;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                if (!isOpen) {
                    e.preventDefault();
                    setIsOpen(true);
                }
            }
        };

        return (
            <>
                <div
                    {...nativeProps}
                    ref={combinedRef}
                    className={classNames(triggerClasses, className, 'eui-multiselect-trigger-wrap')}
                    style={{ ...nativeProps.style, ...componentStyles }}
                >
                    <button
                        ref={triggerButtonRef}
                        id={inputId}
                        type="button"
                        disabled={disabled}
                        className="eui-multiselect-trigger-button"
                        onClick={handleToggle}
                        onKeyDown={handleTriggerKeyDown}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? listboxId : undefined}
                        aria-activedescendant={isOpen ? activeOptionId ?? undefined : undefined}
                        aria-required={required}
                        aria-label={ariaLabel || placeholder}
                        aria-labelledby={ariaLabelledBy}
                    />
                    <div className="eui-multiselect-inner" onClick={handleToggle}>
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
                            aria-hidden="true"
                        />
                    </div>
                </div>
                {isMaxReached && (
                    <span className="eui-visually-hidden" aria-live="polite" role="status">
                        {maxReachedAnnouncement || `Maximum of ${maxSelectedItems} items selected`}
                    </span>
                )}

                <Popover
                    isOpen={isOpen}
                    onClose={handleClose}
                    triggerElement={triggerButtonRef.current ?? combinedRef.current}
                    listboxId={listboxId}
                    onHighlightChange={(_, optionId) => setActiveOptionId(optionId)}
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
                                    onClick={() => handleSelectAll()}
                                >
                                    <Checkbox checked={allSelected} indeterminate={someSelected} onChange={() => handleSelectAll()} />
                                    <span className="eui-multiselect-item-label">{item.label}</span>
                                </div>
                            );
                        }

                        const actualItem = availableItems[index - (showSelectAll ? 1 : 0)];
                        const actualIsSelected = currentValue.some((v) => compare(v, actualItem.value));

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
                                aria-label="Filter items"
                                aria-controls={listboxId}
                            />
                        </div>
                    )}
                </Popover>

                <input type="hidden" name={name} value={currentValue.join(',')} required={required} />
            </>
        );
    },
);
