import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TimesIcon } from '../../assets/icons';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/body-scroll-lock';
import './Drawer.scss';

type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
type DrawerVariant = 'panel' | 'sheet';
type DrawerSnapPoint = number | string;

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    position?: DrawerPosition;
    size?: string;
    variant?: DrawerVariant;
    showDragHandle?: boolean;
    draggable?: boolean;
    snapPoints?: DrawerSnapPoint[];
    initialSnap?: number;
    onSnapChange?: (index: number) => void;
    rounded?: boolean;
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
const DISMISS_THRESHOLD_RATIO = 0.4;
const VELOCITY_DISMISS_PX_PER_MS = 0.6;

const reducedMotionMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const resolveSnapPx = (snap: DrawerSnapPoint, viewportPx: number): number => {
    if (typeof snap === 'number') {
        if (snap <= 1) return Math.round(viewportPx * snap);
        return snap;
    }
    const value = snap.trim();
    if (value.endsWith('%')) {
        const ratio = parseFloat(value) / 100;
        return Math.round(viewportPx * ratio);
    }
    if (value.endsWith('px')) return parseFloat(value);
    if (value.endsWith('vh')) return Math.round(viewportPx * (parseFloat(value) / 100));
    const numeric = parseFloat(value);
    if (!Number.isNaN(numeric)) return numeric;
    return Math.round(viewportPx * 0.5);
};

const Drawer: React.FC<DrawerProps> = ({
    open,
    onClose,
    position = 'right',
    size = '400px',
    variant,
    showDragHandle,
    draggable,
    snapPoints,
    initialSnap = 0,
    onSnapChange,
    rounded,
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
    const onSnapChangeRef = useRef(onSnapChange);
    onSnapChangeRef.current = onSnapChange;
    const generatedId = useId();
    const titleId = `eui-drawer-title-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const isSheetVariant = variant === 'sheet' || (variant === undefined && position === 'bottom' && (snapPoints || showDragHandle || draggable));
    const isBottom = position === 'bottom';
    const isTop = position === 'top';
    const isVertical = isBottom || isTop;
    const isDraggableResolved = draggable ?? (isSheetVariant && isVertical);
    const showHandleResolved = showDragHandle ?? (isSheetVariant && isVertical);
    const isRounded = rounded ?? isSheetVariant;

    const [shouldRender, setShouldRender] = useState(open);
    const [visibleClass, setVisibleClass] = useState(open);
    const [viewportH, setViewportH] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));
    const [snapIndex, setSnapIndex] = useState(initialSnap);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!snapPoints) return;
        const onResize = () => setViewportH(window.innerHeight);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [snapPoints]);

    const resolvedSnapPxList = useMemo(() => {
        if (!snapPoints || snapPoints.length === 0) return null;
        const list = snapPoints.map((p) => resolveSnapPx(p, viewportH));
        return [...list].sort((a, b) => a - b);
    }, [snapPoints, viewportH]);

    const currentSheetHeightPx = useMemo(() => {
        if (resolvedSnapPxList) {
            const safeIndex = Math.min(Math.max(snapIndex, 0), resolvedSnapPxList.length - 1);
            return resolvedSnapPxList[safeIndex];
        }
        return null;
    }, [resolvedSnapPxList, snapIndex]);

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

    useEffect(() => {
        if (!open) {
            setSnapIndex(initialSnap);
            setDragOffset(0);
            setIsDragging(false);
        }
    }, [open, initialSnap]);

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
        lockBodyScroll();

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
            unlockBodyScroll();
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

    const dragStateRef = useRef<{
        startY: number;
        startTime: number;
        lastY: number;
        lastTime: number;
        startHeight: number;
    } | null>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isDraggableResolved || !isVertical) return;
        const target = e.target as HTMLElement;
        if (target.closest('[data-drawer-no-drag]')) return;
        const startHeight = currentSheetHeightPx ?? drawerRef.current?.getBoundingClientRect().height ?? 0;
        dragStateRef.current = {
            startY: e.clientY,
            startTime: performance.now(),
            lastY: e.clientY,
            lastTime: performance.now(),
            startHeight,
        };
        setIsDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const state = dragStateRef.current;
        if (!state) return;
        const delta = e.clientY - state.startY;
        const adjusted = isBottom ? delta : -delta;
        state.lastY = e.clientY;
        state.lastTime = performance.now();
        setDragOffset(Math.max(adjusted, -state.startHeight));
    };

    const finishDrag = (e: React.PointerEvent) => {
        const state = dragStateRef.current;
        if (!state) return;
        dragStateRef.current = null;
        setIsDragging(false);

        const totalDelta = (isBottom ? 1 : -1) * (e.clientY - state.startY);
        const elapsed = Math.max(performance.now() - state.startTime, 1);
        const velocity = totalDelta / elapsed;
        const startHeight = state.startHeight;

        if (resolvedSnapPxList && resolvedSnapPxList.length > 0) {
            const projectedHeight = startHeight - totalDelta;
            if (projectedHeight < resolvedSnapPxList[0] * (1 - DISMISS_THRESHOLD_RATIO) || velocity > VELOCITY_DISMISS_PX_PER_MS) {
                setDragOffset(0);
                onClose();
                return;
            }
            let closest = 0;
            let closestDist = Infinity;
            for (let i = 0; i < resolvedSnapPxList.length; i += 1) {
                const dist = Math.abs(resolvedSnapPxList[i] - projectedHeight);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = i;
                }
            }
            setSnapIndex(closest);
            setDragOffset(0);
            if (closest !== snapIndex) onSnapChangeRef.current?.(closest);
        } else {
            const drawerH = drawerRef.current?.getBoundingClientRect().height ?? 0;
            if (totalDelta > drawerH * DISMISS_THRESHOLD_RATIO || velocity > VELOCITY_DISMISS_PX_PER_MS) {
                setDragOffset(0);
                onClose();
                return;
            }
            setDragOffset(0);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => finishDrag(e);
    const handlePointerCancel = (e: React.PointerEvent) => finishDrag(e);

    if (!shouldRender) return null;

    const isHorizontal = position === 'left' || position === 'right';
    const baseSizeStyle: React.CSSProperties = isHorizontal
        ? { width: size }
        : currentSheetHeightPx != null
            ? { height: `${currentSheetHeightPx}px` }
            : { height: size };

    const transformStyle = (() => {
        if (!isDraggableResolved || !isVertical) return undefined;
        if (dragOffset === 0) return undefined;
        if (isBottom) {
            const offset = Math.max(dragOffset, 0);
            return { transform: `translateY(${offset}px)` };
        }
        const offset = Math.max(dragOffset, 0);
        return { transform: `translateY(-${offset}px)` };
    })();

    const sizeStyle: React.CSSProperties = {
        ...baseSizeStyle,
        ...transformStyle,
        ...(isDragging ? { transition: 'none' } : null),
    };

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
                    {
                        'eui-drawer-visible': visibleClass,
                        'eui-drawer-sheet': isSheetVariant,
                        'eui-drawer-rounded': isRounded,
                        'eui-drawer-dragging': isDragging,
                    },
                    className,
                )}
                style={sizeStyle}
                role="dialog"
                aria-modal="true"
                aria-label={computedAriaLabel}
                aria-labelledby={computedAriaLabelledBy}
                tabIndex={-1}
                onPointerDown={isDraggableResolved && !showHandleResolved ? handlePointerDown : undefined}
                onPointerMove={isDraggableResolved && !showHandleResolved ? handlePointerMove : undefined}
                onPointerUp={isDraggableResolved && !showHandleResolved ? handlePointerUp : undefined}
                onPointerCancel={isDraggableResolved && !showHandleResolved ? handlePointerCancel : undefined}
            >
                {showHandleResolved && !isTop && (
                    <div
                        className="eui-drawer-handle-area"
                        role="separator"
                        aria-orientation="horizontal"
                        aria-label="Drag to resize, press Escape to close"
                        tabIndex={isDraggableResolved ? 0 : -1}
                        onPointerDown={isDraggableResolved ? handlePointerDown : undefined}
                        onPointerMove={isDraggableResolved ? handlePointerMove : undefined}
                        onPointerUp={isDraggableResolved ? handlePointerUp : undefined}
                        onPointerCancel={isDraggableResolved ? handlePointerCancel : undefined}
                    >
                        <div className="eui-drawer-handle" />
                    </div>
                )}
                {headerContent !== null && (
                    <div className="eui-drawer-header" data-drawer-no-drag>
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
                <div className="eui-drawer-body" data-drawer-no-drag>
                    {headerContent === null && !showHandleResolved && (
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
                    <div className="eui-drawer-footer" data-drawer-no-drag>{footer}</div>
                )}
                {showHandleResolved && isTop && (
                    <div
                        className="eui-drawer-handle-area eui-drawer-handle-area-bottom"
                        role="separator"
                        aria-orientation="horizontal"
                        aria-label="Drag to resize, press Escape to close"
                        tabIndex={isDraggableResolved ? 0 : -1}
                        onPointerDown={isDraggableResolved ? handlePointerDown : undefined}
                        onPointerMove={isDraggableResolved ? handlePointerMove : undefined}
                        onPointerUp={isDraggableResolved ? handlePointerUp : undefined}
                        onPointerCancel={isDraggableResolved ? handlePointerCancel : undefined}
                    >
                        <div className="eui-drawer-handle" />
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(drawerContent, document.body);
};

export { Drawer };
export type { DrawerProps, DrawerPosition, DrawerVariant, DrawerSnapPoint };
