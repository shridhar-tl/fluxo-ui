import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, TimesIcon } from '../../assets/icons';
import { useViewport } from '../../hooks/useMobile';

export interface ToolbarDropdownOption {
    id: string;
    label: React.ReactNode;
    description?: string;
    shortcut?: string;
    disabled?: boolean;
}

export interface ToolbarDropdownProps {
    label: string;
    icon?: React.ReactNode;
    options: ToolbarDropdownOption[];
    onSelect: (id: string) => void;
    disabled?: boolean;
    title?: string;
    menuClassName?: string;
    showLabel?: boolean;
}

const ToolbarDropdownInner: React.FC<ToolbarDropdownProps> = ({
    label,
    icon,
    options,
    onSelect,
    disabled = false,
    title,
    menuClassName,
    showLabel = false,
}) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; minWidth: number }>({
        top: 0,
        left: 0,
        minWidth: 0,
    });
    const [activeIdx, setActiveIdx] = useState(0);
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuId = useRef('eui-dd-' + Math.random().toString(36).slice(2, 8));
    const { isCompact, isMobile, isTablet } = useViewport();

    const recompute = useCallback(() => {
        const btn = btnRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            minWidth: rect.width,
        });
    }, []);

    useLayoutEffect(() => {
        if (!open || isCompact) return;
        recompute();
    }, [open, recompute, isCompact]);

    useEffect(() => {
        if (!open || isCompact) return;
        const handleScroll = () => recompute();
        const handleResize = () => recompute();
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [open, recompute, isCompact]);

    useEffect(() => {
        if (!open || !isCompact) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open, isCompact]);

    useEffect(() => {
        if (!open) return;
        const handleDocClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (btnRef.current?.contains(target)) return;
            if (menuRef.current?.contains(target)) return;
            setOpen(false);
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
                btnRef.current?.focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIdx((i) => {
                    let next = i;
                    for (let step = 0; step < options.length; step += 1) {
                        next = (next + 1) % options.length;
                        if (!options[next].disabled) return next;
                    }
                    return i;
                });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIdx((i) => {
                    let next = i;
                    for (let step = 0; step < options.length; step += 1) {
                        next = (next - 1 + options.length) % options.length;
                        if (!options[next].disabled) return next;
                    }
                    return i;
                });
            } else if (e.key === 'Home') {
                e.preventDefault();
                setActiveIdx(options.findIndex((o) => !o.disabled));
            } else if (e.key === 'End') {
                e.preventDefault();
                for (let j = options.length - 1; j >= 0; j -= 1) {
                    if (!options[j].disabled) {
                        setActiveIdx(j);
                        break;
                    }
                }
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const opt = options[activeIdx];
                if (opt && !opt.disabled) {
                    onSelect(opt.id);
                    setOpen(false);
                    btnRef.current?.focus();
                }
            }
        };
        document.addEventListener('mousedown', handleDocClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleDocClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [activeIdx, onSelect, open, options]);

    const toggleOpen = useCallback(() => {
        if (disabled) return;
        setOpen((o) => !o);
        const first = options.findIndex((o) => !o.disabled);
        setActiveIdx(first >= 0 ? first : 0);
    }, [disabled, options]);

    const handleItemClick = useCallback(
        (opt: ToolbarDropdownOption) => {
            if (opt.disabled) return;
            onSelect(opt.id);
            setOpen(false);
            btnRef.current?.focus();
        },
        [onSelect],
    );

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                className={classNames('eui-editor-toolbar-btn eui-editor-toolbar-dd-btn', {
                    'is-active': open,
                    'is-disabled': disabled,
                    'has-label': showLabel,
                })}
                onClick={toggleOpen}
                onMouseDown={(e) => e.preventDefault()}
                disabled={disabled}
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId.current : undefined}
                title={title ?? label}
            >
                {icon && <span className="eui-editor-toolbar-btn-icon">{icon}</span>}
                {showLabel && <span className="eui-editor-toolbar-btn-label">{label}</span>}
                <span className="eui-editor-toolbar-dd-caret" aria-hidden="true">
                    <ChevronDownIcon />
                </span>
            </button>
            {open &&
                createPortal(
                    isCompact ? (
                        <div
                            className={classNames('eui-editor-toolbar-dd-backdrop', {
                                'eui-editor-toolbar-dd-backdrop-mobile': isMobile,
                                'eui-editor-toolbar-dd-backdrop-tablet': isTablet,
                            })}
                            onClick={() => setOpen(false)}
                        >
                            <div
                                ref={menuRef}
                                id={menuId.current}
                                role="menu"
                                aria-label={label}
                                className={classNames('eui-editor-toolbar-dd-menu', 'eui-editor-toolbar-dd-menu-mobile', menuClassName, {
                                    'eui-editor-toolbar-dd-menu-mobile-mobile': isMobile,
                                    'eui-editor-toolbar-dd-menu-mobile-tablet': isTablet,
                                })}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="eui-editor-toolbar-dd-menu-header">
                                    <span className="eui-editor-toolbar-dd-menu-title">{label}</span>
                                    <button
                                        type="button"
                                        className="eui-editor-toolbar-dd-menu-close"
                                        onClick={() => setOpen(false)}
                                        aria-label="Close"
                                    >
                                        <TimesIcon />
                                    </button>
                                </div>
                                <div className="eui-editor-toolbar-dd-menu-body">
                                    {options.map((opt, idx) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            role="menuitem"
                                            className={classNames('eui-editor-toolbar-dd-item', 'eui-editor-toolbar-dd-item-mobile', {
                                                'is-active': idx === activeIdx,
                                                'is-disabled': opt.disabled,
                                            })}
                                            onClick={() => handleItemClick(opt)}
                                            disabled={opt.disabled}
                                        >
                                            <span className="eui-editor-toolbar-dd-item-label">{opt.label}</span>
                                            {opt.shortcut && (
                                                <span className="eui-editor-toolbar-dd-item-shortcut">{opt.shortcut}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            ref={menuRef}
                            id={menuId.current}
                            role="menu"
                            aria-label={label}
                            className={classNames('eui-editor-toolbar-dd-menu', menuClassName)}
                            style={{
                                top: coords.top,
                                left: coords.left,
                                minWidth: Math.max(coords.minWidth, 160),
                            }}
                        >
                            {options.map((opt, idx) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    role="menuitem"
                                    className={classNames('eui-editor-toolbar-dd-item', {
                                        'is-active': idx === activeIdx,
                                        'is-disabled': opt.disabled,
                                    })}
                                    onClick={() => handleItemClick(opt)}
                                    onMouseEnter={() => !opt.disabled && setActiveIdx(idx)}
                                    disabled={opt.disabled}
                                >
                                    <span className="eui-editor-toolbar-dd-item-label">{opt.label}</span>
                                    {opt.shortcut && (
                                        <span className="eui-editor-toolbar-dd-item-shortcut">{opt.shortcut}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ),
                    document.body,
                )}
        </>
    );
};

export const ToolbarDropdown = memo(ToolbarDropdownInner);
