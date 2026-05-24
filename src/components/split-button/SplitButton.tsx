import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '../../assets/icons';
import { ButtonVariant } from '../../types';
import { Button } from '../Button';
import Icon from '../Icon';
import '../eui-base.scss';
import './SplitButton.scss';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export interface SplitButtonItem {
    label?: string;
    icon?: IconComponent | React.ReactElement;
    onClick?: () => void;
    disabled?: boolean;
    danger?: boolean;
    divider?: boolean;
    shortcut?: string;
}

export type SplitButtonLayout = 'default' | 'outlined' | 'plain' | 'rounded' | 'sharp';
export type SplitButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SplitButtonMenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'auto';

export interface SplitButtonProps {
    label: string;
    onClick?: (e: React.MouseEvent) => void | Promise<unknown>;
    items: SplitButtonItem[];
    variant?: ButtonVariant;
    layout?: SplitButtonLayout;
    size?: SplitButtonSize;
    leftIcon?: IconComponent | React.ReactElement;
    rightIcon?: IconComponent | React.ReactElement;
    loading?: boolean;
    disabled?: boolean;
    menuPlacement?: SplitButtonMenuPlacement;
    menuWidth?: 'trigger' | 'auto' | number;
    triggerIcon?: IconComponent | React.ReactElement;
    ariaLabel?: string;
    id?: string;
    className?: string;
}

interface MenuPosition {
    top: number;
    left: number;
    width: number;
    placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

const focusableMenuItem = (root: HTMLElement | null, index: number): HTMLElement | null => {
    if (!root) return null;
    const items = root.querySelectorAll<HTMLElement>('[data-eui-menuitem="true"]:not([data-disabled="true"])');
    return items[index] ?? null;
};

const focusWithoutScroll = (node: HTMLElement | null) => {
    if (!node) return;
    try {
        node.focus({ preventScroll: true });
    } catch {
        node.focus();
    }
};

const SplitButton: React.FC<SplitButtonProps> = ({
    label,
    onClick,
    items,
    variant = 'primary',
    layout = 'default',
    size = 'md',
    leftIcon,
    rightIcon,
    loading = false,
    disabled = false,
    menuPlacement = 'bottom-end',
    menuWidth = 'auto',
    triggerIcon,
    ariaLabel,
    id,
    className,
}) => {
    const generatedId = useId();
    const baseId = id ?? `split-${generatedId}`;
    const menuId = `${baseId}-menu`;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<MenuPosition | null>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const typeAheadRef = useRef<{ buffer: string; timer: number | null }>({ buffer: '', timer: null });

    const enabledItemIndices = useMemo(
        () =>
            items
                .map((item, index) => ({ item, index }))
                .filter(({ item }) => !item.divider && !item.disabled)
                .map(({ index }) => index),
        [items],
    );

    const computePosition = useCallback(() => {
        const trigger = triggerRef.current;
        const menu = menuRef.current;
        if (!trigger || !menu) return;

        const rect = trigger.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const viewportW = window.innerWidth;

        let placement = menuPlacement === 'auto' ? 'bottom-end' : menuPlacement;
        const spaceBelow = viewportH - rect.bottom;
        const spaceAbove = rect.top;

        if (placement.startsWith('bottom') && spaceBelow < menuRect.height + 8 && spaceAbove > spaceBelow) {
            placement = placement.replace('bottom', 'top') as MenuPosition['placement'];
        } else if (placement.startsWith('top') && spaceAbove < menuRect.height + 8 && spaceBelow > spaceAbove) {
            placement = placement.replace('top', 'bottom') as MenuPosition['placement'];
        }

        let top = 0;
        let left = 0;
        const wrapperRect = wrapperRef.current?.getBoundingClientRect() ?? rect;

        if (placement.startsWith('bottom')) {
            top = wrapperRect.bottom + window.scrollY + 4;
        } else {
            top = wrapperRect.top + window.scrollY - menuRect.height - 4;
        }

        const desiredWidth = typeof menuWidth === 'number' ? menuWidth : menuWidth === 'trigger' ? wrapperRect.width : menuRect.width;

        if (placement.endsWith('start')) {
            left = wrapperRect.left + window.scrollX;
        } else {
            left = wrapperRect.right + window.scrollX - desiredWidth;
        }

        if (left + desiredWidth > viewportW + window.scrollX - 8) {
            left = viewportW + window.scrollX - desiredWidth - 8;
        }
        if (left < window.scrollX + 8) {
            left = window.scrollX + 8;
        }

        setPosition({ top, left, width: desiredWidth, placement: placement as MenuPosition['placement'] });
    }, [menuPlacement, menuWidth]);

    useLayoutEffect(() => {
        if (!open) {
            setPosition(null);
            return;
        }
        computePosition();
        const raf = requestAnimationFrame(() => computePosition());
        return () => cancelAnimationFrame(raf);
    }, [open, computePosition]);

    useEffect(() => {
        if (!open) return;
        const handleScroll = () => computePosition();
        const handleResize = () => computePosition();
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
        window.addEventListener('blur', () => setOpen(false));
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [open, computePosition]);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (!menuRef.current || !wrapperRef.current) return;
            if (menuRef.current.contains(e.target as Node)) return;
            if (wrapperRef.current.contains(e.target as Node)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    useEffect(() => {
        if (!open) {
            setActiveIndex(-1);
            return;
        }
        const firstEnabled = enabledItemIndices[0];
        if (firstEnabled != null) {
            setActiveIndex(firstEnabled);
        }
    }, [open, enabledItemIndices]);

    useEffect(() => {
        if (!open || !position) return;
        focusWithoutScroll(focusableMenuItem(menuRef.current, 0));
    }, [open, position]);

    const closeAndRestoreFocus = useCallback(() => {
        setOpen(false);
        focusWithoutScroll(triggerRef.current);
    }, []);

    const moveActive = useCallback(
        (delta: number) => {
            if (enabledItemIndices.length === 0) return;
            const currentEnabledPos = enabledItemIndices.indexOf(activeIndex);
            const nextPos =
                currentEnabledPos === -1
                    ? delta > 0
                        ? 0
                        : enabledItemIndices.length - 1
                    : (currentEnabledPos + delta + enabledItemIndices.length) % enabledItemIndices.length;
            const nextItemIndex = enabledItemIndices[nextPos];
            setActiveIndex(nextItemIndex);
            focusWithoutScroll(focusableMenuItem(menuRef.current, nextPos));
        },
        [activeIndex, enabledItemIndices],
    );

    const handleTriggerKey = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(true);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setOpen(true);
            }
        },
        [],
    );

    const handleMenuKey = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    moveActive(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    moveActive(-1);
                    break;
                case 'Home':
                    e.preventDefault();
                    if (enabledItemIndices[0] != null) {
                        setActiveIndex(enabledItemIndices[0]);
                        focusWithoutScroll(focusableMenuItem(menuRef.current, 0));
                    }
                    break;
                case 'End':
                    e.preventDefault();
                    if (enabledItemIndices.length) {
                        const last = enabledItemIndices.length - 1;
                        setActiveIndex(enabledItemIndices[last]);
                        focusWithoutScroll(focusableMenuItem(menuRef.current, last));
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeAndRestoreFocus();
                    break;
                case 'Tab':
                    setOpen(false);
                    break;
                default:
                    if (e.key.length === 1) {
                        const ta = typeAheadRef.current;
                        if (ta.timer) window.clearTimeout(ta.timer);
                        ta.buffer = (ta.buffer + e.key).toLowerCase();
                        const matchIdx = enabledItemIndices.find((i) =>
                            (items[i].label || '').toLowerCase().startsWith(ta.buffer),
                        );
                        if (matchIdx != null) {
                            setActiveIndex(matchIdx);
                            const enabledPos = enabledItemIndices.indexOf(matchIdx);
                            focusWithoutScroll(focusableMenuItem(menuRef.current, enabledPos));
                        }
                        ta.timer = window.setTimeout(() => {
                            ta.buffer = '';
                        }, 600);
                    }
            }
        },
        [moveActive, enabledItemIndices, closeAndRestoreFocus, items],
    );

    const handleItemClick = (item: SplitButtonItem) => {
        if (item.disabled) return;
        item.onClick?.();
        closeAndRestoreFocus();
    };

    const triggerLabel = ariaLabel || `More ${label} actions`;

    return (
        <div
            ref={wrapperRef}
            id={baseId}
            className={classNames('eui-split-button', `eui-split-button-layout-${layout}`, className)}
            role="group"
            aria-label={label}
        >
            <Button
                label={label}
                onClick={onClick}
                variant={variant}
                size={size}
                layout={layout}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                disabled={disabled}
                isLoading={loading}
                className="eui-split-button-primary"
            />
            <button
                ref={triggerRef}
                type="button"
                className={classNames(
                    'eui-button',
                    `eui-button-${layout}`,
                    `eui-button-variant-${variant}`,
                    `eui-button-icon-${size}`,
                    'eui-split-button-trigger',
                    {
                        'eui-button-disabled': disabled,
                        'eui-button-shadow': layout !== 'plain' && layout !== 'outlined' && layout !== 'sharp',
                    },
                )}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={triggerLabel}
                disabled={disabled}
                onClick={() => !disabled && setOpen((v) => !v)}
                onKeyDown={handleTriggerKey}
            >
                <Icon icon={triggerIcon ?? ChevronDownIcon} className="eui-split-button-trigger-icon" />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        id={menuId}
                        role="menu"
                        aria-orientation="vertical"
                        className={classNames('eui-split-button-menu', position && `eui-split-button-menu-${position.placement}`)}
                        style={{
                            position: 'absolute',
                            top: position?.top ?? 0,
                            left: position?.left ?? 0,
                            minWidth: position?.width ?? 0,
                            opacity: position ? 1 : 0,
                            visibility: position ? 'visible' : 'hidden',
                            pointerEvents: position ? 'auto' : 'none',
                        }}
                        onKeyDown={handleMenuKey}
                    >
                        {items.map((item, index) => {
                            if (item.divider) {
                                return <div key={`div-${index}`} role="separator" className="eui-split-button-menu-separator" />;
                            }
                            return (
                                <button
                                    key={`item-${index}`}
                                    type="button"
                                    role="menuitem"
                                    data-eui-menuitem="true"
                                    data-disabled={item.disabled ? 'true' : 'false'}
                                    className={classNames('eui-split-button-menu-item', {
                                        'eui-split-button-menu-item-active': activeIndex === index,
                                        'eui-split-button-menu-item-danger': item.danger,
                                        'eui-split-button-menu-item-disabled': item.disabled,
                                    })}
                                    disabled={item.disabled}
                                    tabIndex={-1}
                                    onClick={() => handleItemClick(item)}
                                    onMouseEnter={() => !item.disabled && setActiveIndex(index)}
                                >
                                    {item.icon && <Icon icon={item.icon} className="eui-split-button-menu-item-icon" />}
                                    <span className="eui-split-button-menu-item-label">{item.label}</span>
                                    {item.shortcut && <span className="eui-split-button-menu-item-shortcut">{item.shortcut}</span>}
                                </button>
                            );
                        })}
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export { SplitButton };
export default SplitButton;
