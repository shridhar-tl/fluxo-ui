import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TimesIcon } from '../../assets/icons';
import './Drawer.scss';

type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    position?: DrawerPosition;
    size?: string;
    backdrop?: boolean;
    pushContent?: boolean;
    pushContentSelector?: string;
    closeOnEscape?: boolean;
    closeOnBackdropClick?: boolean;
    className?: string;
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    title?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
}

const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[contenteditable="true"]',
].join(',');

const EXIT_DURATION_MS = 300;

const reducedMotionMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const Drawer: React.FC<DrawerProps> = ({
    open,
    onClose,
    position = 'right',
    size = '400px',
    backdrop = true,
    pushContent = false,
    pushContentSelector,
    closeOnEscape = true,
    closeOnBackdropClick = true,
    className,
    children,
    header,
    footer,
    title,
    ariaLabel,
    ariaLabelledBy,
}) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const generatedId = useId();
    const titleId = `eui-drawer-title-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const [shouldRender, setShouldRender] = useState(open);
    const [visibleClass, setVisibleClass] = useState(open);

    useEffect(() => {
        if (open) {
            setShouldRender(true);
            const r = requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisibleClass(true));
            });
            return () => cancelAnimationFrame(r);
        }
        setVisibleClass(false);
        const reducedMotion = reducedMotionMatches();
        const wait = reducedMotion ? 0 : EXIT_DURATION_MS;
        const t = window.setTimeout(() => setShouldRender(false), wait);
        return () => window.clearTimeout(t);
    }, [open]);

    const handleFocusTrap = useCallback((e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const drawer = drawerRef.current;
        if (!drawer) return;
        const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector)).filter(
            (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
        );
        if (focusable.length === 0) {
            e.preventDefault();
            drawer.focus();
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first || !drawer.contains(document.activeElement)) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last || !drawer.contains(document.activeElement)) {
                e.preventDefault();
                first.focus();
            }
        }
    }, []);

    useEffect(() => {
        if (!shouldRender) return;

        previousFocusRef.current = document.activeElement as HTMLElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const inerted: HTMLElement[] = [];
        const portalEl = portalRef.current;
        const siblings = Array.from(document.body.children) as HTMLElement[];
        for (const sibling of siblings) {
            if (sibling === portalEl) continue;
            if (sibling.hasAttribute('inert')) continue;
            sibling.setAttribute('inert', '');
            inerted.push(sibling);
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onCloseRef.current();
                return;
            }
            handleFocusTrap(e);
        };
        document.addEventListener('keydown', handleKeyDown);

        const focusFrame = requestAnimationFrame(() => {
            const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
            if (focusable && focusable.length > 0) {
                (focusable[0] as HTMLElement).focus();
            } else {
                drawerRef.current?.focus();
            }
        });

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            cancelAnimationFrame(focusFrame);
            for (const el of inerted) el.removeAttribute('inert');
            previousFocusRef.current?.focus();
        };
    }, [shouldRender, closeOnEscape, handleFocusTrap]);

    useEffect(() => {
        if (!pushContent) return;

        const target = pushContentSelector
            ? document.querySelector(pushContentSelector)
            : (document.getElementById('root') ?? document.body.firstElementChild);
        if (!target || !(target instanceof HTMLElement)) return;

        const reducedMotion = reducedMotionMatches();
        const duration = reducedMotion ? '0s' : '0.3s';

        if (visibleClass) {
            target.style.transition = `transform ${duration} cubic-bezier(0.4, 0, 0.2, 1)`;
            const transforms: Record<DrawerPosition, string> = {
                left: `translateX(${size})`,
                right: `translateX(-${size})`,
                top: `translateY(${size})`,
                bottom: `translateY(-${size})`,
            };
            target.style.transform = transforms[position];
        } else {
            target.style.transform = '';
        }

        return () => {
            target.style.transform = '';
            target.style.transition = '';
        };
    }, [visibleClass, pushContent, pushContentSelector, position, size]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!shouldRender) return null;

    const isHorizontal = position === 'left' || position === 'right';
    const sizeStyle = isHorizontal ? { width: size } : { height: size };

    const titleElement = !header && title ? <span id={titleId}>{title}</span> : null;
    const headerContent = header ?? titleElement;
    const computedAriaLabelledBy = ariaLabelledBy ?? (titleElement ? titleId : undefined);
    const computedAriaLabel = !computedAriaLabelledBy ? (ariaLabel ?? title) : undefined;

    const drawerContent = (
        <div
            ref={portalRef}
            className={classNames('eui-drawer-wrapper', {
                'eui-drawer-open': visibleClass,
                'eui-drawer-no-backdrop': !backdrop,
            })}
            onClick={backdrop ? handleBackdropClick : undefined}
        >
            <div
                ref={drawerRef}
                className={classNames(
                    'eui-drawer',
                    `eui-drawer-${position}`,
                    { 'eui-drawer-visible': visibleClass },
                    className,
                )}
                style={sizeStyle}
                role="dialog"
                aria-modal="true"
                aria-label={computedAriaLabel}
                aria-labelledby={computedAriaLabelledBy}
                tabIndex={-1}
            >
                {headerContent !== null && (
                    <div className="eui-drawer-header">
                        <div className="eui-drawer-header-content">{headerContent}</div>
                        <button
                            className="eui-drawer-close"
                            onClick={onClose}
                            aria-label="Close drawer"
                            type="button"
                        >
                            <TimesIcon />
                        </button>
                    </div>
                )}
                <div className="eui-drawer-body">
                    {headerContent === null && (
                        <button
                            className="eui-drawer-close-floating"
                            onClick={onClose}
                            aria-label="Close drawer"
                            type="button"
                        >
                            <TimesIcon />
                        </button>
                    )}
                    {children}
                </div>
                {footer && (
                    <div className="eui-drawer-footer">{footer}</div>
                )}
            </div>
        </div>
    );

    return createPortal(drawerContent, document.body);
};

export { Drawer };
export type { DrawerProps, DrawerPosition };
