import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import { BaseComponentProps, ComponentEvent, ListItem } from '../types';
import { generateId, getComponentClasses } from '../utils';
import Icon from './Icon';
import './MultiStateCheckbox.scss';

interface MultiStateCheckboxProps<T = any> extends BaseComponentProps {
    items: ListItem[];
    value?: T;
    onChange?: (event: ComponentEvent<T>) => void;
    required?: boolean;
    id?: string;
}

export const MultiStateCheckbox = forwardRef<HTMLButtonElement, MultiStateCheckboxProps>(
    ({ items, value, onChange, required = false, id, disabled = false, className, name, args, ...baseProps }, ref) => {
        const [inputId] = useState(id || generateId());

        const currentIndex = items.findIndex((item) => item.value === value);
        const currentItem = currentIndex >= 0 ? items[currentIndex] : items[0];

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (disabled) return;

            const nextIndex = (currentIndex + 1) % items.length;
            const nextItem = items[nextIndex];

            if (onChange) {
                onChange({
                    event: e,
                    value: nextItem.value,
                    name,
                    args,
                });
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleClick(e as any);
            }
        };

        const buttonClasses = getComponentClasses(
            { ...baseProps, disabled },
            classNames(
                'eui-multistate-checkbox',
                {
                    'eui-multistate-checkbox-disabled': disabled,
                },
                className,
            ),
        );

        const iconBoxClasses = classNames('eui-multistate-checkbox-icon-box', {
            'eui-multistate-checkbox-icon-box-empty': !currentItem?.icon && !currentItem?.value,
        });

        const currentIcon = currentItem?.icon;

        return (
            <button
                ref={ref}
                id={inputId}
                type="button"
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={buttonClasses}
                aria-pressed={!!currentItem}
                aria-label={`Multi-state checkbox: ${currentItem?.label || 'None selected'}`}
            >
                <div className={iconBoxClasses}>{!!currentIcon && <Icon icon={currentIcon} className="w-3 h-3" />}</div>
                <span className="eui-multistate-checkbox-label">{currentItem?.label || 'Select option'}</span>
                <input type="hidden" name={name} value={currentItem?.value?.toString() || ''} required={required} />
            </button>
        );
    },
);
