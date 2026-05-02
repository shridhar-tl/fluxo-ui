import classNames from 'classnames';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useViewport } from '../../hooks/useMobile';
import { Button } from '../Button';
import Icon from '../Icon';
import { ConfirmPopoverAction, ConfirmPopoverData } from './types';
import { useConfirmPopoverPosition } from './useConfirmPopoverPosition';
import './confirm-popover.scss';

interface ConfirmPopoverPanelProps {
    data: ConfirmPopoverData;
    onDismiss: (id: number) => void;
}

const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

const computeDefaultActionIndex = (
    actions: ConfirmPopoverAction[],
    explicit?: number
): number => {
    if (typeof explicit === 'number' && explicit >= 0 && explicit < actions.length) return explicit;
    const explicitFlagIndex = actions.findIndex((a) => a.defaultAction === true);
    if (explicitFlagIndex !== -1) return explicitFlagIndex;
    const hasDanger = actions.some((a) => a.variant === 'danger');
    if (hasDanger) {
        const firstNonDanger = actions.findIndex((a) => a.variant !== 'danger');
        return firstNonDanger !== -1 ? firstNonDanger : actions.length - 1;
    }
    return Math.max(0, actions.length - 1);
};

const ConfirmPopoverPanel = ({ data, onDismiss }: ConfirmPopoverPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const actionsContainerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { calculatePosition } = useConfirmPopoverPosition();
    const { isCompact, isMobile, isTablet } = useViewport();
    const generatedId = useId();
    const safeId = generatedId.replace(/[^a-zA-Z0-9_-]/g, '');
    const titleId = `eui-confirm-popover-title-${safeId}`;
    const messageId = `eui-confirm-popover-message-${safeId}`;
    const headingLevel = data.headingLevel ?? 3;
    const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const dismissedRef = useRef(false);

    const dismiss = useCallback(() => {
        if (dismissedRef.current) return;
        dismissedRef.current = true;
        data.onClose?.();
        onDismiss(data.id);
    }, [data, onDismiss]);

    useClickOutside(panelRef, dismiss, !isCompact);

    useEffect(() => {
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        return () => {
            previousFocusRef.current?.focus?.();
        };
    }, []);

    useEffect(() => {
        if (!panelRef.current || isCompact) return;

        const recompute = () => {
            if (panelRef.current && data.target) {
                calculatePosition(data.target, panelRef.current, data.placement ?? 'auto');
            }
        };

        recompute();
        const showTimer = window.setTimeout(() => setIsVisible(true), 30);

        window.addEventListener('scroll', recompute, true);
        window.addEventListener('resize', recompute);

        return () => {
            window.clearTimeout(showTimer);
            window.removeEventListener('scroll', recompute, true);
            window.removeEventListener('resize', recompute);
        };
    }, [data.target, data.placement, calculatePosition, isCompact]);

    useEffect(() => {
        if (!isCompact) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const timer = window.setTimeout(() => setIsVisible(true), 30);
        return () => {
            window.clearTimeout(timer);
            document.body.style.overflow = previousOverflow;
        };
    }, [isCompact]);

    useEffect(() => {
        if (!isVisible) return;
        const defaultIdx = computeDefaultActionIndex(data.actions, data.defaultActionIndex);
        const buttons = actionsContainerRef.current?.querySelectorAll<HTMLElement>('button, a');
        const target = buttons?.[defaultIdx];
        if (target) {
            target.focus();
        } else {
            panelRef.current?.focus?.();
        }
    }, [isVisible, data.actions, data.defaultActionIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                dismiss();
                return;
            }
            if (e.key !== 'Tab') return;
            const panel = panelRef.current;
            if (!panel) return;
            if (!panel.contains(document.activeElement)) return;

            const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(
                (el) => el.tabIndex !== -1,
            );
            if (focusable.length === 0) {
                e.preventDefault();
                panel.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [dismiss]);

    const accessibleNameId = data.title ? titleId : undefined;
    const accessibleNameValue = data.title ? undefined : 'Confirmation';

    const panelInner = (
        <div
            ref={panelRef}
            role="dialog"
            aria-modal={isCompact ? 'true' : 'false'}
            aria-labelledby={accessibleNameId}
            aria-label={accessibleNameValue}
            aria-describedby={messageId}
            tabIndex={-1}
            className={classNames('eui-confirm-popover', {
                'eui-confirm-popover-visible': isVisible,
                'eui-confirm-popover-hidden': !isVisible,
                'eui-confirm-popover-mobile': isMobile,
                'eui-confirm-popover-tablet': isTablet,
            })}
            onClick={isCompact ? (e) => e.stopPropagation() : undefined}
        >
            <div className="eui-confirm-popover-body">
                {(data.icon || data.title) && (
                    <div className="eui-confirm-popover-header">
                        {data.icon && (
                            <span className="eui-confirm-popover-icon" aria-hidden="true">
                                <Icon icon={data.icon} />
                            </span>
                        )}
                        {data.title && (
                            <HeadingTag id={titleId} className="eui-confirm-popover-title">{data.title}</HeadingTag>
                        )}
                    </div>
                )}
                <div id={messageId} className="eui-confirm-popover-message">
                    {typeof data.message === 'string' ? <p>{data.message}</p> : data.message}
                </div>
            </div>
            {data.actions.length > 0 && (
                <div ref={actionsContainerRef} className="eui-confirm-popover-actions">
                    {data.actions.map((action, idx) => (
                        <Button
                            key={idx}
                            size={isCompact ? 'md' : 'sm'}
                            variant={action.variant ?? 'default'}
                            layout={action.layout ?? 'outlined'}
                            aria-describedby={messageId}
                            onClick={() => {
                                action.onClick();
                                dismiss();
                            }}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );

    if (isCompact) {
        return (
            <div className="eui-confirm-popover-backdrop" onClick={dismiss}>
                {panelInner}
            </div>
        );
    }

    return panelInner;
};

export default ConfirmPopoverPanel;
