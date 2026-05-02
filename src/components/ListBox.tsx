import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './ListBox.scss';

export interface ListBoxOption<T = any> {
    id: string | number;
    label: string;
    value: T;
    disabled?: boolean;
    icon?: React.ReactNode;
    description?: string;
    metadata?: Record<string, any>;
}

export interface ListBoxProps<T = any> {
    options: ListBoxOption<T>[];
    value?: T | T[];
    onChange?: (value: T | T[]) => void;

    multiple?: boolean;

    emptyMessage?: string;
    itemTemplate?: (option: ListBoxOption<T>) => React.ReactNode;
    selectedTemplate?: (option: ListBoxOption<T>) => React.ReactNode;

    searchable?: boolean;
    searchPlaceholder?: string;
    filter?: (option: ListBoxOption<T>, searchQuery: string) => boolean;

    grouped?: boolean;
    groupBy?: (option: ListBoxOption<T>) => string;
    groupTemplate?: (groupName: string, options: ListBoxOption<T>[]) => React.ReactNode;

    className?: string;
    listClassName?: string;
    optionClassName?: string;
    selectedClassName?: string;
    maxHeight?: string | number;

    disabled?: boolean;
    selectAll?: boolean;
    clearable?: boolean;

    onSearch?: (query: string) => void;
    onSelectAll?: () => void;
    onClearAll?: () => void;

    compareFn?: (a: T, b: T) => boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
}

const InnerCheckbox: React.FC<{ checked?: boolean; indeterminate?: boolean; disabled?: boolean }> = ({ checked, indeterminate, disabled }) => {
    const checkboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate || false;
        }
    }, [indeterminate]);

    return (
        <div className="eui-listbox-checkbox">
            <input ref={checkboxRef} type="checkbox" checked={checked} disabled={disabled} readOnly className="eui-listbox-checkbox-input" tabIndex={-1} aria-hidden="true" />
            <div
                className={classNames('eui-listbox-checkbox-box', {
                    'eui-listbox-checkbox-checked': checked,
                    'eui-listbox-checkbox-indeterminate': indeterminate,
                    'eui-listbox-checkbox-disabled': disabled,
                })}
                aria-hidden="true"
            >
                {(checked || indeterminate) && (
                    <svg
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {indeterminate ? <path d="M5 12h14" /> : <path d="M5 13l4 4L19 7" />}
                    </svg>
                )}
            </div>
        </div>
    );
};

const SearchIcon: React.FC = () => (
    <svg
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
    >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ClearIcon: React.FC = () => (
    <svg
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
    >
        <path d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const defaultCompare = <T,>(a: T, b: T): boolean => {
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

export function ListBox<T = any>({
    options = [],
    value,
    onChange,
    multiple = false,
    emptyMessage = 'No options available',
    itemTemplate,
    searchable = false,
    searchPlaceholder = 'Search...',
    filter,
    grouped = false,
    groupBy,
    groupTemplate,
    className = '',
    listClassName = '',
    optionClassName = '',
    selectedClassName = '',
    maxHeight = '300px',
    disabled = false,
    selectAll = false,
    clearable = false,
    onSearch,
    onSelectAll,
    onClearAll,
    compareFn,
    ariaLabel,
    ariaLabelledBy,
}: ListBoxProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const listRef = useRef<HTMLDivElement>(null);

    const compare = compareFn || defaultCompare<T>;

    const selectedValues = useMemo(() => {
        if (value === undefined || value === null) return [] as T[];
        return Array.isArray(value) ? value : [value];
    }, [value]);

    const isSelected = (option: ListBoxOption<T>) => {
        return selectedValues.some((v) => compare(v, option.value));
    };

    const filteredOptions = useMemo(() => {
        if (!searchQuery) return options;

        const defaultFilter = (opt: ListBoxOption<T>, query: string) => {
            const searchStr = query.toLowerCase();
            return (
                opt.label.toLowerCase().includes(searchStr) ||
                opt.description?.toLowerCase().includes(searchStr) ||
                String(opt.id).toLowerCase().includes(searchStr)
            );
        };

        const filterFn = filter || defaultFilter;
        return options.filter((opt) => filterFn(opt, searchQuery));
    }, [options, searchQuery, filter]);

    const groupedOptions = useMemo(() => {
        if (!grouped || !groupBy) return { '': filteredOptions };

        return filteredOptions.reduce(
            (acc, option) => {
                const groupName = groupBy(option);
                if (!acc[groupName]) acc[groupName] = [];
                acc[groupName].push(option);
                return acc;
            },
            {} as Record<string, ListBoxOption<T>[]>,
        );
    }, [grouped, groupBy, filteredOptions]);

    const flatOptions = useMemo(() => {
        if (!grouped || !groupBy) return filteredOptions;
        return Object.values(groupedOptions).flat();
    }, [filteredOptions, grouped, groupBy, groupedOptions]);

    useEffect(() => {
        setActiveIndex((prev) => {
            if (prev >= flatOptions.length) return Math.max(0, flatOptions.length - 1);
            return prev;
        });
    }, [flatOptions.length]);

    const handleSelect = (option: ListBoxOption<T>) => {
        if (disabled || option.disabled) return;

        let newValue: T | T[];

        if (multiple) {
            const currentValues = selectedValues;
            const isCurrentlySelected = isSelected(option);

            if (isCurrentlySelected) {
                newValue = currentValues.filter((v) => !compare(v, option.value));
            } else {
                newValue = [...currentValues, option.value];
            }
        } else {
            newValue = option.value;
        }

        onChange?.(newValue);
    };

    const handleSelectAll = () => {
        if (!multiple) return;

        const allValues = filteredOptions.filter((opt) => !opt.disabled).map((opt) => opt.value);

        onChange?.(allValues);
        onSelectAll?.();
    };

    const handleClearAll = () => {
        onChange?.(multiple ? ([] as T[]) : (null as unknown as T));
        onClearAll?.();
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        onSearch?.(query);
    };

    const allSelected = useMemo(() => {
        const selectableOptions = filteredOptions.filter((opt) => !opt.disabled);
        if (selectableOptions.length === 0) return false;
        return selectableOptions.every((opt) => isSelected(opt));
    }, [filteredOptions, selectedValues]);

    const someSelected = useMemo(() => {
        return selectedValues.length > 0 && !allSelected;
    }, [selectedValues, allSelected]);

    const defaultItemTemplate = (option: ListBoxOption<T>) => (
        <div className="eui-listbox-option-content">
            {multiple && <InnerCheckbox checked={isSelected(option)} disabled={option.disabled} />}
            {option.icon && <span className="eui-listbox-option-icon">{option.icon}</span>}
            <div className="eui-listbox-option-body">
                <div className="eui-listbox-option-label">{option.label}</div>
                {option.description && <div className="eui-listbox-option-description">{option.description}</div>}
            </div>
        </div>
    );

    const defaultGroupTemplate = (groupName: string) => (
        <div className="eui-listbox-group-header" role="presentation">{groupName}</div>
    );

    const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (flatOptions.length === 0) return;

        const move = (delta: number) => {
            const len = flatOptions.length;
            let next = activeIndex < 0 ? 0 : activeIndex + delta;
            if (next < 0) next = len - 1;
            if (next >= len) next = 0;
            setActiveIndex(next);
        };

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                move(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                move(-1);
                break;
            case 'Home':
                e.preventDefault();
                setActiveIndex(0);
                break;
            case 'End':
                e.preventDefault();
                setActiveIndex(flatOptions.length - 1);
                break;
            case 'Enter':
            case ' ':
                if (activeIndex >= 0 && activeIndex < flatOptions.length) {
                    e.preventDefault();
                    handleSelect(flatOptions[activeIndex]);
                }
                break;
            default:
                break;
        }
    };

    const optionId = (id: string | number) => `eui-listbox-option-${id}`;

    const renderOption = (option: ListBoxOption<T>, indexInList: number) => {
        const selected = isSelected(option);
        const template = itemTemplate || defaultItemTemplate;
        const isActive = activeIndex >= 0 && flatOptions[activeIndex]?.id === option.id;

        return (
            <div
                key={String(option.id)}
                id={optionId(option.id)}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => !option.disabled && setActiveIndex(indexInList)}
                className={classNames('eui-listbox-option', optionClassName, {
                    [selectedClassName || 'eui-listbox-option-selected']: selected,
                    'eui-listbox-option-active': isActive,
                    'eui-listbox-option-disabled': option.disabled,
                })}
                role="option"
                aria-selected={selected}
                aria-disabled={option.disabled}
            >
                {template(option)}
            </div>
        );
    };

    const activeOptionId = activeIndex >= 0 && flatOptions[activeIndex]
        ? optionId(flatOptions[activeIndex].id)
        : undefined;

    let runningIndex = 0;

    return (
        <div className={classNames('eui-listbox', className, { 'eui-listbox-disabled': disabled })}>
            {searchable && (
                <div className="eui-listbox-search">
                    <div className="eui-listbox-search-wrap">
                        <span className="eui-listbox-search-icon"><SearchIcon /></span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            disabled={disabled}
                            className="eui-listbox-search-input"
                            aria-label="Search options"
                        />
                    </div>
                </div>
            )}

            {multiple && (selectAll || clearable) && (
                <div className="eui-listbox-toolbar">
                    {selectAll && (
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            disabled={disabled || allSelected}
                            className="eui-listbox-select-all"
                        >
                            <InnerCheckbox checked={allSelected} indeterminate={someSelected} disabled={disabled} />
                            <span>Select All</span>
                        </button>
                    )}
                    {clearable && selectedValues.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            disabled={disabled}
                            className="eui-listbox-clear-all"
                        >
                            <ClearIcon />
                            Clear All
                        </button>
                    )}
                </div>
            )}

            <div
                ref={listRef}
                className={classNames('eui-listbox-list', listClassName)}
                style={{ maxHeight }}
                role="listbox"
                tabIndex={disabled ? -1 : 0}
                aria-multiselectable={multiple}
                aria-disabled={disabled || undefined}
                aria-activedescendant={activeOptionId}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                onKeyDown={handleListKeyDown}
            >
                {filteredOptions.length === 0 ? (
                    <div className="eui-listbox-empty">{emptyMessage}</div>
                ) : grouped ? (
                    Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                        <div key={groupName}>
                            {groupTemplate ? groupTemplate(groupName, groupOptions) : defaultGroupTemplate(groupName)}
                            {groupOptions.map((option) => {
                                const idx = runningIndex++;
                                return renderOption(option, idx);
                            })}
                        </div>
                    ))
                ) : (
                    filteredOptions.map((option) => {
                        const idx = runningIndex++;
                        return renderOption(option, idx);
                    })
                )}
            </div>

            {multiple && selectedValues.length > 0 && (
                <div className="eui-listbox-footer">
                    {selectedValues.length} {selectedValues.length === 1 ? 'item' : 'items'} selected
                </div>
            )}
        </div>
    );
}

export default ListBox;
