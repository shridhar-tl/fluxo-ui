import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';

import cn from 'classnames';

import { ChevronDownIcon, ErrorIcon, InfoIcon, SuccessIcon, TimesIcon, WarningIcon } from '../../assets/icons';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getCustomToneStyle } from '../../utils/color-tone';
import { renderIcon, type IconProp } from '../../utils/render-icon';
import '../eui-base.scss';
import './Alert.scss';

type AlertType = 'info' | 'success' | 'warning' | 'error' | 'neutral';
type AlertVariant = 'soft' | 'solid' | 'outline' | 'left-accent' | 'top-accent' | 'minimal';
type AlertSize = 'sm' | 'md' | 'lg';
type AlertActionsPlacement = 'inline' | 'bottom';
type AlertRole = 'alert' | 'status' | 'none';

interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'role' | 'color'> {
    type?: AlertType;
    variant?: AlertVariant;
    size?: AlertSize;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    icon?: IconProp | false;
    color?: string;
    closable?: boolean;
    closeLabel?: string;
    onClose?: () => void;
    onClosed?: () => void;
    open?: boolean;
    defaultOpen?: boolean;
    actions?: React.ReactNode;
    actionsPlacement?: AlertActionsPlacement;
    details?: React.ReactNode;
    detailsLabel?: string;
    hideDetailsLabel?: string;
    defaultExpanded?: boolean;
    autoClose?: number;
    pauseOnHover?: boolean;
    showProgress?: boolean;
    banner?: boolean;
    elevated?: boolean;
    role?: AlertRole;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    restoreFocus?: boolean;
}

const iconByType: Record<AlertType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    info: InfoIcon,
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    neutral: InfoIcon,
};

const defaultRole: Record<AlertType, 'alert' | 'status'> = {
    info: 'status',
    success: 'status',
    neutral: 'status',
    warning: 'alert',
    error: 'alert',
};

const exitDurationMs = 220;

const focusableSelector =
    'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

const isVisible = (element: HTMLElement) => element.getClientRects().length > 0;

const canReceiveFocus = (element: HTMLElement | null): element is HTMLElement =>
    element !== null &&
    element !== document.body &&
    element.isConnected &&
    element.matches(focusableSelector) &&
    !element.closest('[inert]') &&
    isVisible(element);

const findNextFocusable = (root: HTMLElement): HTMLElement | null => {
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(focusableSelector));
    for (const candidate of candidates) {
        if (root.contains(candidate)) continue;
        if (!(root.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
        if (candidate.closest('[inert]') || !isVisible(candidate)) continue;
        return candidate;
    }
    return null;
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
    (
        {
            type = 'info',
            variant = 'soft',
            size = 'md',
            title,
            description,
            children,
            icon,
            color,
            closable = false,
            closeLabel,
            onClose,
            onClosed,
            open,
            defaultOpen = true,
            actions,
            actionsPlacement = 'bottom',
            details,
            detailsLabel = 'Show details',
            hideDetailsLabel = 'Hide details',
            defaultExpanded = false,
            autoClose,
            pauseOnHover = true,
            showProgress = true,
            banner = false,
            elevated = false,
            role,
            headingLevel = 3,
            restoreFocus = true,
            className,
            style,
            onMouseEnter,
            onMouseLeave,
            onFocus,
            onBlur,
            ...rest
        },
        ref,
    ) => {
        const reducedMotion = useReducedMotion();
        const [internalOpen, setInternalOpen] = useState(defaultOpen);
        const isOpen = open ?? internalOpen;
        const [mounted, setMounted] = useState(isOpen);
        const [exiting, setExiting] = useState(false);
        const [expanded, setExpanded] = useState(defaultExpanded);
        const [hoverPaused, setHoverPaused] = useState(false);
        const [focusPaused, setFocusPaused] = useState(false);
        const [liveReady, setLiveReady] = useState(false);
        const paused = hoverPaused || focusPaused;
        const rootRef = useRef<HTMLDivElement | null>(null);
        const autoClosedRef = useRef(false);
        const timerRef = useRef<number | null>(null);
        const exitRef = useRef<number | null>(null);
        const remainingRef = useRef(autoClose ?? 0);
        const startedRef = useRef(0);
        const previousFocusRef = useRef<HTMLElement | null>(null);
        const onClosedRef = useRef(onClosed);
        const detailsId = `eui-alert-details-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

        const setRefs = useCallback(
            (node: HTMLDivElement | null) => {
                rootRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            },
            [ref],
        );

        const requestClose = useCallback(() => {
            if (open === undefined) setInternalOpen(false);
            onClose?.();
        }, [open, onClose]);

        const autoCloseNow = useCallback(() => {
            if (autoClosedRef.current) return;
            autoClosedRef.current = true;
            requestClose();
        }, [requestClose]);

        useEffect(() => {
            onClosedRef.current = onClosed;
        }, [onClosed]);

        useEffect(() => {
            setHoverPaused(false);
            setFocusPaused(false);
            if (!isOpen) return;
            autoClosedRef.current = false;
            previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }, [isOpen]);

        useEffect(() => {
            if (exitRef.current !== null) {
                window.clearTimeout(exitRef.current);
                exitRef.current = null;
            }
            if (isOpen) {
                setMounted(true);
                setExiting(false);
                return;
            }
            if (!mounted) return;
            const finish = () => {
                exitRef.current = null;
                setMounted(false);
                setExiting(false);
                setLiveReady(false);
                onClosedRef.current?.();
            };
            if (reducedMotion) {
                finish();
                return;
            }
            setExiting(true);
            exitRef.current = window.setTimeout(finish, exitDurationMs);
        }, [isOpen, mounted, reducedMotion]);

        useEffect(() => {
            remainingRef.current = autoClose ?? 0;
        }, [autoClose, isOpen]);

        useEffect(() => {
            if (!isOpen || !autoClose || autoClose <= 0 || paused || autoClosedRef.current) return;
            startedRef.current = Date.now();
            timerRef.current = window.setTimeout(autoCloseNow, Math.max(0, remainingRef.current));
            return () => {
                if (timerRef.current !== null) window.clearTimeout(timerRef.current);
                remainingRef.current -= Date.now() - startedRef.current;
            };
        }, [isOpen, autoClose, paused, autoCloseNow]);

        useEffect(() => {
            if (!mounted || liveReady) return;
            const frame = requestAnimationFrame(() => setLiveReady(true));
            return () => cancelAnimationFrame(frame);
        }, [mounted, liveReady]);

        useEffect(
            () => () => {
                if (timerRef.current !== null) window.clearTimeout(timerRef.current);
                if (exitRef.current !== null) window.clearTimeout(exitRef.current);
            },
            [],
        );

        if (!mounted) return null;

        const timed = Boolean(autoClose && autoClose > 0);
        const canPauseOnHover = timed && pauseOnHover;

        const handleClose = () => {
            const root = rootRef.current;
            let target: HTMLElement | null = null;
            if (restoreFocus && root && root.contains(document.activeElement)) {
                const previous = previousFocusRef.current;
                target = canReceiveFocus(previous) && !root.contains(previous) ? previous : findNextFocusable(root);
            }
            requestClose();
            target?.focus();
        };

        const resolvedRole = role ?? defaultRole[type];
        const pendingLive = resolvedRole !== 'none' && !liveReady;
        const HeadingTag = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const body = description ?? children;
        const iconNode = icon === false ? null : renderIcon(icon ?? iconByType[type], 'eui-alert-icon');
        const titleText = typeof title === 'string' ? title : undefined;
        const actionsNode = actions ? <div className="eui-alert-actions">{actions}</div> : null;

        return (
            <div
                ref={setRefs}
                {...rest}
                role={resolvedRole === 'none' ? undefined : resolvedRole}
                aria-live={resolvedRole === 'none' ? undefined : resolvedRole === 'alert' ? 'assertive' : 'polite'}
                aria-atomic={resolvedRole === 'none' ? undefined : true}
                className={cn(
                    'eui-alert',
                    `eui-alert-${type}`,
                    `eui-alert-${variant}`,
                    `eui-alert-${size}`,
                    {
                        'eui-alert-banner': banner,
                        'eui-alert-elevated': elevated,
                        'eui-alert-exiting': exiting,
                        'eui-alert-no-icon': !iconNode,
                        'eui-alert-has-title': title !== undefined && title !== null,
                        'eui-alert-actions-inline': actionsNode && actionsPlacement === 'inline',
                    },
                    className,
                )}
                style={{ ...getCustomToneStyle(color), ...style }}
                onMouseEnter={(event) => {
                    onMouseEnter?.(event);
                    if (canPauseOnHover) setHoverPaused(true);
                }}
                onMouseLeave={(event) => {
                    onMouseLeave?.(event);
                    if (canPauseOnHover) setHoverPaused(false);
                }}
                onFocus={(event) => {
                    onFocus?.(event);
                    if (timed) setFocusPaused(true);
                }}
                onBlur={(event) => {
                    onBlur?.(event);
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPaused(false);
                }}
            >
                <div className={cn('eui-alert-inner', { 'eui-alert-inner-pending': pendingLive })}>
                    {iconNode}
                    <div className="eui-alert-content">
                        {title !== undefined && title !== null && <HeadingTag className="eui-alert-title">{title}</HeadingTag>}
                        {body !== undefined && body !== null && <div className="eui-alert-description">{body}</div>}
                        {details !== undefined && details !== null && (
                            <>
                                <button
                                    type="button"
                                    className={cn('eui-alert-details-toggle', { 'eui-alert-details-open': expanded })}
                                    aria-expanded={expanded}
                                    aria-controls={detailsId}
                                    onClick={() => setExpanded((prev) => !prev)}
                                >
                                    {expanded ? hideDetailsLabel : detailsLabel}
                                    <ChevronDownIcon aria-hidden="true" />
                                </button>
                                <div id={detailsId} className="eui-alert-details" hidden={!expanded}>
                                    {details}
                                </div>
                            </>
                        )}
                        {actionsPlacement === 'bottom' && actionsNode}
                    </div>
                    {actionsPlacement === 'inline' && actionsNode}
                    {closable && (
                        <button
                            type="button"
                            className="eui-alert-close"
                            onClick={handleClose}
                            aria-label={closeLabel ?? (titleText ? `Dismiss ${titleText}` : 'Dismiss alert')}
                        >
                            <TimesIcon aria-hidden="true" />
                        </button>
                    )}
                </div>
                {timed && showProgress && !exiting && (
                    <div
                        className={cn('eui-alert-progress', { 'eui-alert-progress-paused': paused })}
                        style={{ animationDuration: `${autoClose}ms` }}
                        aria-hidden="true"
                    />
                )}
            </div>
        );
    },
);

Alert.displayName = 'Alert';

export { Alert };
export type { AlertActionsPlacement, AlertProps, AlertRole, AlertSize, AlertType, AlertVariant };
