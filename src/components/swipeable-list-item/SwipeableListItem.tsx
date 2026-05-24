import cn from 'classnames';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import '../eui-base.scss';
import './SwipeableListItem.scss';

type SwipeColor = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface SwipeableAction {
    key?: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    color?: SwipeColor;
    onTrigger?: () => void;
    background?: string;
    fullSwipe?: boolean;
    ariaLabel?: string;
}

type SwipeableVariant = 'inline' | 'card' | 'compact';

interface SwipeableListItemProps {
    children: React.ReactNode;
    leftActions?: SwipeableAction[];
    rightActions?: SwipeableAction[];
    threshold?: number;
    fullSwipeThreshold?: number;
    variant?: SwipeableVariant;
    disabled?: boolean;
    onSwipeOpen?: (side: 'left' | 'right') => void;
    onSwipeClose?: () => void;
    closeOnSelect?: boolean;
    className?: string;
    actionWidth?: number;
}

interface SwipeableListItemHandle {
    close: () => void;
    openLeft: () => void;
    openRight: () => void;
}

const VELOCITY_OPEN_PX_PER_MS = 0.4;

const SwipeableListItem = forwardRef<SwipeableListItemHandle, SwipeableListItemProps>(
    (
        {
            children,
            leftActions = [],
            rightActions = [],
            threshold = 0.4,
            fullSwipeThreshold = 0.7,
            variant = 'inline',
            disabled = false,
            onSwipeOpen,
            onSwipeClose,
            closeOnSelect = true,
            className,
            actionWidth = 80,
        },
        ref,
    ) => {
        const rootRef = useRef<HTMLDivElement>(null);
        const [offset, setOffset] = useState(0);
        const [isDragging, setIsDragging] = useState(false);
        const dragRef = useRef<{
            startX: number;
            startY: number;
            startTime: number;
            startOffset: number;
            cancelled: boolean;
            axisLocked: boolean;
        } | null>(null);

        const leftMax = leftActions.length * actionWidth;
        const rightMax = rightActions.length * actionWidth;

        const close = useCallback(() => {
            setOffset(0);
            onSwipeClose?.();
        }, [onSwipeClose]);

        const openLeft = useCallback(() => {
            if (leftActions.length === 0) return;
            setOffset(leftMax);
            onSwipeOpen?.('left');
        }, [leftActions.length, leftMax, onSwipeOpen]);

        const openRight = useCallback(() => {
            if (rightActions.length === 0) return;
            setOffset(-rightMax);
            onSwipeOpen?.('right');
        }, [rightActions.length, rightMax, onSwipeOpen]);

        useImperativeHandle(ref, () => ({ close, openLeft, openRight }), [close, openLeft, openRight]);

        useEffect(() => {
            if (offset === 0) return;
            const handleDocClick = (e: MouseEvent) => {
                if (!rootRef.current?.contains(e.target as Node)) close();
            };
            const handleKey = (e: KeyboardEvent) => {
                if (e.key === 'Escape') close();
            };
            document.addEventListener('mousedown', handleDocClick);
            document.addEventListener('touchstart', handleDocClick as unknown as EventListener);
            document.addEventListener('keydown', handleKey);
            return () => {
                document.removeEventListener('mousedown', handleDocClick);
                document.removeEventListener('touchstart', handleDocClick as unknown as EventListener);
                document.removeEventListener('keydown', handleKey);
            };
        }, [offset, close]);

        const handlePointerDown = (e: React.PointerEvent) => {
            if (disabled) return;
            if ((e.target as HTMLElement).closest('[data-swipe-no-drag]')) return;
            dragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                startTime: performance.now(),
                startOffset: offset,
                cancelled: false,
                axisLocked: false,
            };
            setIsDragging(true);
        };

        const handlePointerMove = (e: React.PointerEvent) => {
            const state = dragRef.current;
            if (!state || state.cancelled) return;
            const dx = e.clientX - state.startX;
            const dy = e.clientY - state.startY;
            if (!state.axisLocked) {
                if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
                if (Math.abs(dy) > Math.abs(dx)) {
                    state.cancelled = true;
                    setIsDragging(false);
                    return;
                }
                state.axisLocked = true;
                (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            }
            let next = state.startOffset + dx;
            if (next > 0 && leftActions.length === 0) next = 0;
            if (next < 0 && rightActions.length === 0) next = 0;
            next = Math.max(Math.min(next, leftMax), -rightMax);
            setOffset(next);
        };

        const finishDrag = (e: React.PointerEvent) => {
            const state = dragRef.current;
            if (!state) return;
            dragRef.current = null;
            setIsDragging(false);
            if (state.cancelled) return;

            const dx = e.clientX - state.startX;
            const elapsed = Math.max(performance.now() - state.startTime, 1);
            const velocity = dx / elapsed;

            const goingLeft = offset < 0;
            const goingRight = offset > 0;

            if (goingRight) {
                const fullThreshold = leftMax * fullSwipeThreshold;
                const fullAction = leftActions.find((a) => a.fullSwipe);
                if (fullAction && offset >= fullThreshold) {
                    fullAction.onTrigger?.();
                    close();
                    return;
                }
                if (offset >= leftMax * threshold || velocity > VELOCITY_OPEN_PX_PER_MS) {
                    openLeft();
                } else {
                    close();
                }
                return;
            }

            if (goingLeft) {
                const fullThreshold = rightMax * fullSwipeThreshold;
                const fullAction = rightActions.find((a) => a.fullSwipe);
                if (fullAction && Math.abs(offset) >= fullThreshold) {
                    fullAction.onTrigger?.();
                    close();
                    return;
                }
                if (Math.abs(offset) >= rightMax * threshold || velocity < -VELOCITY_OPEN_PX_PER_MS) {
                    openRight();
                } else {
                    close();
                }
                return;
            }
            close();
        };

        const handleActionClick = (action: SwipeableAction) => {
            action.onTrigger?.();
            if (closeOnSelect) close();
        };

        const leftRevealed = offset > 0 ? offset : 0;
        const rightRevealed = offset < 0 ? -offset : 0;

        const renderActions = (actions: SwipeableAction[], side: 'left' | 'right', revealedWidth: number) => {
            if (actions.length === 0) return null;
            return (
                <div
                    className={cn('eui-swipeable-actions', `eui-swipeable-actions-${side}`)}
                    aria-hidden={revealedWidth === 0}
                    style={{
                        width: `${revealedWidth}px`,
                        transition: isDragging ? 'none' : 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    <div
                        className="eui-swipeable-actions-inner"
                        style={{ width: `${actions.length * actionWidth}px` }}
                    >
                        {actions.map((action, idx) => {
                            const color = action.color ?? 'default';
                            return (
                                <button
                                    key={action.key ?? idx}
                                    type="button"
                                    data-swipe-no-drag
                                    className={cn('eui-swipeable-action', `eui-swipeable-action-color-${color}`)}
                                    onClick={() => handleActionClick(action)}
                                    aria-label={action.ariaLabel ?? (typeof action.label === 'string' ? action.label : undefined)}
                                    style={{
                                        width: `${actionWidth}px`,
                                        background: action.background,
                                    }}
                                >
                                    {action.icon && <span className="eui-swipeable-action-icon">{action.icon}</span>}
                                    <span className="eui-swipeable-action-label">{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        };

        return (
            <div
                ref={rootRef}
                className={cn('eui-swipeable-list-item', `eui-swipeable-variant-${variant}`, className, {
                    'eui-swipeable-open-left': offset > 0,
                    'eui-swipeable-open-right': offset < 0,
                    'eui-swipeable-dragging': isDragging,
                    'eui-swipeable-disabled': disabled,
                })}
            >
                {renderActions(leftActions, 'left', leftRevealed)}
                <div
                    className="eui-swipeable-content"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishDrag}
                    onPointerCancel={finishDrag}
                >
                    {children}
                </div>
                {renderActions(rightActions, 'right', rightRevealed)}
            </div>
        );
    },
);

SwipeableListItem.displayName = 'SwipeableListItem';

export { SwipeableListItem };
export type { SwipeableListItemProps, SwipeableListItemHandle, SwipeableAction, SwipeableVariant };
