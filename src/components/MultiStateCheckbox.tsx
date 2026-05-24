import classNames from 'classnames';
import React, { forwardRef, useEffect, useState } from 'react';
import { BaseComponentProps, ComponentEvent, ListItem } from '../types';
import { generateId, getComponentClasses, splitBaseAndNativeProps } from '../utils';
import Icon from './Icon';
import './eui-base.scss';
import './MultiStateCheckbox.scss';

interface MultiStateCheckboxProps<T = any> extends BaseComponentProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'size' | 'value' | 'type'> {
    items: ListItem[];
    value?: T;
    onChange?: (event: ComponentEvent<T>) => void;
    required?: boolean;
    id?: string;
    ariaLabel?: string;
}

const isDevEnvironment = (): boolean => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
            return process.env.NODE_ENV !== 'production';
        }
    } catch {
        // ignore
    }
    return true;
};

export const MultiStateCheckbox = forwardRef<HTMLButtonElement, MultiStateCheckboxProps>(
    ({ items, value, onChange, required = false, id, disabled = false, className, name, args, ariaLabel, ...rest }, ref) => {
        const { styleProps: baseProps, nativeProps } = splitBaseAndNativeProps(rest);
        const [inputId] = useState(id || generateId());

        const currentIndex = items.findIndex((item) => item.value === value);
        const hasMatch = currentIndex >= 0;
        const currentItem = hasMatch ? items[currentIndex] : items[0];

        useEffect(() => {
            if (!isDevEnvironment()) return;
            if (value !== undefined && !hasMatch) {
                // eslint-disable-next-line no-console
                console.warn(
                    `[FluxoUI MultiStateCheckbox] value "${String(value)}" does not match any item in items[]. Falling back to first option.`,
                );
            }
        }, [value, hasMatch]);

        const moveBy = (delta: 1 | -1, e: React.SyntheticEvent) => {
            if (disabled) return;
            const len = items.length;
            if (len === 0) return;
            const nextIndex = (currentIndex + delta + len) % len;
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

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (disabled) return;
            moveBy(e.shiftKey ? -1 : 1, e);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                moveBy(1, e);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                moveBy(-1, e);
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
        const itemCount = items.length;
        const isThreeOrMoreState = itemCount >= 3;

        const stateLabel = currentItem?.label || 'None selected';

        return (
            <button
                {...nativeProps}
                ref={ref}
                id={inputId}
                type="button"
                onClick={(e) => {
                    nativeProps.onClick?.(e);
                    handleClick(e);
                }}
                onKeyDown={(e) => {
                    nativeProps.onKeyDown?.(e);
                    handleKeyDown(e);
                }}
                disabled={disabled}
                className={buttonClasses}
                {...(isThreeOrMoreState
                    ? {}
                    : {
                          'aria-checked': hasMatch && currentIndex > 0 ? 'true' : currentIndex === 0 ? 'false' : 'mixed',
                          role: 'checkbox',
                      })}
                aria-label={ariaLabel || stateLabel}
            >
                <div className={iconBoxClasses}>{!!currentIcon && <Icon icon={currentIcon} className="w-3 h-3" />}</div>
                <span className="eui-multistate-checkbox-label">{currentItem?.label || 'Select option'}</span>
                <input type="hidden" name={name} value={currentItem?.value?.toString() || ''} required={required} />
            </button>
        );
    },
);
