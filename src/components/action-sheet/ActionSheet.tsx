import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/body-scroll-lock';
import './ActionSheet.scss';

type ActionSheetStyle = 'ios' | 'material' | 'plain';

interface ActionSheetAction {
    key?: string;
    label: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
    destructive?: boolean;
    onSelect?: () => void;
}

interface ActionSheetProps {
    open: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    message?: React.ReactNode;
    actions: ActionSheetAction[];
    cancelLabel?: string;
    showCancel?: boolean;
    onCancel?: () => void;
    variant?: ActionSheetStyle;
    closeOnSelect?: boolean;
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
    safeArea?: boolean;
    className?: string;
    ariaLabel?: string;
}

const ENTER_DELAY = 16;
const EXIT_DURATION = 250;

const prefersReducedMotion = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const ActionSheet: React.FC<ActionSheetProps> = ({
    open,
    onClose,
    title,
    message,
    actions,
    cancelLabel = 'Cancel',
    showCancel = true,
    onCancel,
    variant = 'ios',
    closeOnSelect = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    safeArea = true,
    className,
    ariaLabel,
}) => {
    const [render, setRender] = useState(open);
    const [visible, setVisible] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (open) {
            setRender(true);
            const id = window.setTimeout(() => setVisible(true), ENTER_DELAY);
            return () => window.clearTimeout(id);
        }
        setVisible(false);
        const wait = prefersReducedMotion() ? 0 : EXIT_DURATION;
        const id = window.setTimeout(() => setRender(false), wait);
        return () => window.clearTimeout(id);
    }, [open]);

    useEffect(() => {
        if (!render) return;
        lockBodyScroll();
        const previousFocus = document.activeElement as HTMLElement | null;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape) {
                e.preventDefault();
                onCloseRef.current();
                return;
            }
            if (e.key === 'Tab') {
                const sheet = sheetRef.current;
                if (!sheet) return;
                const focusable = Array.from(
                    sheet.querySelectorAll<HTMLElement>('button:not([disabled])'),
                );
                if (focusable.length === 0) {
                    e.preventDefault();
                    return;
                }
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                const active = document.activeElement as HTMLElement | null;
                if (e.shiftKey) {
                    if (active === first || !sheet.contains(active)) {
                        e.preventDefault();
                        last.focus();
                    }
                } else if (active === last || !sheet.contains(active)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKey);

        const focusFrame = requestAnimationFrame(() => {
            const first = sheetRef.current?.querySelector<HTMLElement>('button:not([disabled])');
            first?.focus();
        });

        return () => {
            unlockBodyScroll();
            document.removeEventListener('keydown', handleKey);
            cancelAnimationFrame(focusFrame);
            previousFocus?.focus?.();
        };
    }, [render, closeOnEscape]);

    const handleBackdrop = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget && closeOnBackdropClick) onClose();
        },
        [closeOnBackdropClick, onClose],
    );

    const handleSelect = (action: ActionSheetAction) => {
        if (action.disabled) return;
        action.onSelect?.();
        if (closeOnSelect) onClose();
    };

    const handleCancel = () => {
        onCancel?.();
        onClose();
    };

    if (!render) return null;

    const node = (
        <div
            className={cn('eui-action-sheet-wrapper', { 'eui-action-sheet-open': visible })}
            onClick={handleBackdrop}
            role="presentation"
        >
            <div
                ref={sheetRef}
                className={cn(
                    'eui-action-sheet',
                    `eui-action-sheet-variant-${variant}`,
                    {
                        'eui-action-sheet-visible': visible,
                        'eui-action-sheet-safe-area': safeArea,
                    },
                    className,
                )}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined) ?? 'Actions'}
            >
                <div className="eui-action-sheet-group eui-action-sheet-actions-group">
                    {(title || message) && (
                        <div className="eui-action-sheet-header">
                            {title && <div className="eui-action-sheet-title">{title}</div>}
                            {message && <div className="eui-action-sheet-message">{message}</div>}
                        </div>
                    )}
                    {actions.map((action, idx) => (
                        <button
                            key={action.key ?? idx}
                            type="button"
                            className={cn('eui-action-sheet-item', {
                                'eui-action-sheet-item-destructive': action.destructive,
                                'eui-action-sheet-item-disabled': action.disabled,
                            })}
                            onClick={() => handleSelect(action)}
                            disabled={action.disabled}
                        >
                            {action.icon && <span className="eui-action-sheet-item-icon" aria-hidden="true">{action.icon}</span>}
                            <span className="eui-action-sheet-item-text">
                                <span className="eui-action-sheet-item-label">{action.label}</span>
                                {action.description && (
                                    <span className="eui-action-sheet-item-description">{action.description}</span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>

                {showCancel && (
                    <div className="eui-action-sheet-group eui-action-sheet-cancel-group">
                        <button
                            type="button"
                            className="eui-action-sheet-item eui-action-sheet-item-cancel"
                            onClick={handleCancel}
                        >
                            <span className="eui-action-sheet-item-text">
                                <span className="eui-action-sheet-item-label">{cancelLabel}</span>
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(node, document.body);
};

export { ActionSheet };
export type { ActionSheetProps, ActionSheetAction, ActionSheetStyle };
