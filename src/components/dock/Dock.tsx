import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { hideTooltip, showTooltip } from '../tooltip/tooltip-api';
import Icon from '../Icon';
import './Dock.scss';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export interface DockItem {
    id: string;
    icon: IconComponent | React.ReactElement;
    label?: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string | number;
    separatorAfter?: boolean;
}

export type DockEdgePosition = 'bottom' | 'top' | 'left' | 'right';
export type DockAlign = 'start' | 'center' | 'end';
export type DockLayout = 'pill' | 'rectangle' | 'floating' | 'attached';
export type DockBackground = 'glass' | 'solid' | 'gradient' | 'transparent';

export type DockMode = 'fixed' | 'inline';

export interface DockProps {
    items: DockItem[];
    position?: DockEdgePosition;
    align?: DockAlign;
    layout?: DockLayout;
    background?: DockBackground;
    gradient?: { from: string; to: string; angle?: number };
    magnification?: number;
    magnificationDistance?: number;
    iconSize?: number;
    gap?: number;
    autoHide?: boolean;
    autoHideDelay?: number;
    triggerZone?: number;
    showTooltips?: boolean;
    onItemClick?: (id: string) => void;
    mode?: DockMode;
    id?: string;
    className?: string;
    ariaLabel?: string;
}

const Dock: React.FC<DockProps> = ({
    items,
    position = 'bottom',
    align = 'center',
    layout = 'pill',
    background = 'glass',
    gradient,
    magnification = 1.6,
    magnificationDistance = 80,
    iconSize = 40,
    gap = 8,
    autoHide = false,
    autoHideDelay = 500,
    triggerZone = 12,
    showTooltips = true,
    onItemClick,
    mode = 'fixed',
    id,
    className,
    ariaLabel,
}) => {
    const generatedId = useId();
    const dockId = id ?? `dock-${generatedId}`;

    const dockRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLElement | null)[]>([]);
    const [scales, setScales] = useState<number[]>(() => items.map(() => 1));
    const [hidden, setHidden] = useState(autoHide);
    const [reducedMotion, setReducedMotion] = useState(false);
    const hideTimer = useRef<number | null>(null);
    const focusedIndex = useRef<number>(-1);

    const orientation: 'horizontal' | 'vertical' = position === 'left' || position === 'right' ? 'vertical' : 'horizontal';

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (ev: MediaQueryListEvent) => setReducedMotion(ev.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useLayoutEffect(() => {
        setScales((prev) => {
            if (prev.length === items.length) return prev;
            return items.map(() => 1);
        });
    }, [items.length]);

    const resetScales = useCallback(() => {
        setScales(items.map(() => 1));
    }, [items]);

    const computeScales = useCallback(
        (clientX: number, clientY: number) => {
            if (magnification <= 1 || reducedMotion) return;
            const next: number[] = [];
            itemRefs.current.forEach((el, idx) => {
                if (!el) {
                    next[idx] = 1;
                    return;
                }
                const rect = el.getBoundingClientRect();
                const itemCx = rect.left + rect.width / 2;
                const itemCy = rect.top + rect.height / 2;
                const distance = orientation === 'horizontal' ? Math.abs(clientX - itemCx) : Math.abs(clientY - itemCy);
                const t = Math.max(0, 1 - distance / magnificationDistance);
                const scale = 1 + (magnification - 1) * t;
                next[idx] = items[idx]?.disabled ? 1 : scale;
            });
            setScales(next);
        },
        [magnification, magnificationDistance, orientation, reducedMotion, items],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            computeScales(e.clientX, e.clientY);
        },
        [computeScales],
    );

    const handlePointerLeave = useCallback(() => {
        resetScales();
        if (autoHide) {
            if (hideTimer.current) window.clearTimeout(hideTimer.current);
            hideTimer.current = window.setTimeout(() => setHidden(true), autoHideDelay);
        }
    }, [resetScales, autoHide, autoHideDelay]);

    const handlePointerEnter = useCallback(() => {
        if (autoHide) {
            if (hideTimer.current) window.clearTimeout(hideTimer.current);
            setHidden(false);
        }
    }, [autoHide]);

    const handleFocus = (index: number) => {
        focusedIndex.current = index;
        if (autoHide) setHidden(false);
        if (magnification > 1 && !reducedMotion) {
            const next = items.map((_, idx) => {
                const distance = Math.abs(idx - index) * (iconSize + gap);
                const t = Math.max(0, 1 - distance / magnificationDistance);
                return 1 + (magnification - 1) * t;
            });
            setScales(next);
        }
    };

    const handleBlur = () => {
        focusedIndex.current = -1;
        resetScales();
    };

    const handleKey = (e: React.KeyboardEvent, index: number) => {
        const isHorizontal = orientation === 'horizontal';
        if ((isHorizontal && e.key === 'ArrowRight') || (!isHorizontal && e.key === 'ArrowDown')) {
            e.preventDefault();
            const next = items.findIndex((it, i) => i > index && !it.disabled);
            if (next >= 0) (itemRefs.current[next] as HTMLElement | null)?.focus();
        } else if ((isHorizontal && e.key === 'ArrowLeft') || (!isHorizontal && e.key === 'ArrowUp')) {
            e.preventDefault();
            for (let i = index - 1; i >= 0; i -= 1) {
                if (!items[i].disabled) {
                    (itemRefs.current[i] as HTMLElement | null)?.focus();
                    break;
                }
            }
        } else if (e.key === 'Home') {
            e.preventDefault();
            const first = items.findIndex((it) => !it.disabled);
            if (first >= 0) (itemRefs.current[first] as HTMLElement | null)?.focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            for (let i = items.length - 1; i >= 0; i -= 1) {
                if (!items[i].disabled) {
                    (itemRefs.current[i] as HTMLElement | null)?.focus();
                    break;
                }
            }
        }
    };

    const handleItemActivate = (item: DockItem) => {
        if (item.disabled) return;
        item.onClick?.();
        onItemClick?.(item.id);
    };

    const positionStyles = useMemo<React.CSSProperties>(() => {
        if (mode === 'inline') {
            const styles: React.CSSProperties = {
                display: 'inline-flex',
                pointerEvents: 'auto',
            };
            if (orientation === 'vertical') styles.flexDirection = 'column';
            return styles;
        }
        const styles: React.CSSProperties = { position: 'fixed', zIndex: 50 };
        const offset = layout === 'floating' ? 16 : 0;
        switch (position) {
            case 'top':
                styles.top = offset;
                styles.left = 0;
                styles.right = 0;
                styles.display = 'flex';
                break;
            case 'bottom':
                styles.bottom = offset;
                styles.left = 0;
                styles.right = 0;
                styles.display = 'flex';
                break;
            case 'left':
                styles.left = offset;
                styles.top = 0;
                styles.bottom = 0;
                styles.display = 'flex';
                styles.flexDirection = 'column';
                break;
            case 'right':
                styles.right = offset;
                styles.top = 0;
                styles.bottom = 0;
                styles.display = 'flex';
                styles.flexDirection = 'column';
                break;
        }
        if (orientation === 'horizontal') {
            styles.justifyContent = align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center';
            styles.alignItems = position === 'top' ? 'flex-start' : 'flex-end';
        } else {
            styles.alignItems = align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center';
            styles.justifyContent = 'center';
        }
        styles.pointerEvents = 'none';
        return styles;
    }, [mode, position, layout, align, orientation]);

    const dockStyles = useMemo<React.CSSProperties>(() => {
        const styles: React.CSSProperties = { gap: `${gap}px`, padding: '8px', pointerEvents: 'auto' };
        if (background === 'gradient' && gradient) {
            styles.background = `linear-gradient(${gradient.angle ?? 90}deg, ${gradient.from}, ${gradient.to})`;
        }
        if (orientation === 'horizontal') {
            styles.flexDirection = 'row';
        } else {
            styles.flexDirection = 'column';
        }

        if (hidden && autoHide) {
            switch (position) {
                case 'bottom':
                    styles.transform = `translateY(calc(100% + ${triggerZone}px))`;
                    break;
                case 'top':
                    styles.transform = `translateY(calc(-100% - ${triggerZone}px))`;
                    break;
                case 'left':
                    styles.transform = `translateX(calc(-100% - ${triggerZone}px))`;
                    break;
                case 'right':
                    styles.transform = `translateX(calc(100% + ${triggerZone}px))`;
                    break;
            }
        }

        return styles;
    }, [gap, background, gradient, orientation, hidden, autoHide, position, triggerZone]);

    const handleTooltipShow = (e: React.MouseEvent, label: string) => {
        if (!showTooltips || !label) return;
        const placement = position === 'bottom' ? 'topLeft' : position === 'top' ? 'bottomLeft' : position === 'left' ? 'bottomRight' : 'bottomLeft';
        showTooltip(e, { content: label, placement });
    };

    const handleTooltipHide = () => {
        if (showTooltips) hideTooltip({ timeout: 0 });
    };

    return (
        <>
            <div style={positionStyles} aria-hidden="false" data-eui-dock-wrapper>
                <div
                    ref={dockRef}
                    id={dockId}
                    role="toolbar"
                    aria-orientation={orientation}
                    aria-label={ariaLabel ?? 'Dock'}
                    className={classNames(
                        'eui-dock',
                        `eui-dock-position-${position}`,
                        `eui-dock-layout-${layout}`,
                        `eui-dock-background-${background}`,
                        {
                            'eui-dock-vertical': orientation === 'vertical',
                            'eui-dock-hidden': hidden && autoHide,
                            'eui-dock-reduced-motion': reducedMotion,
                        },
                        className,
                    )}
                    style={dockStyles}
                    onPointerMove={handlePointerMove}
                    onPointerEnter={handlePointerEnter}
                    onPointerLeave={handlePointerLeave}
                >
                    {items.map((item, index) => {
                        const scale = scales[index] ?? 1;
                        const Component = item.href ? 'a' : 'button';
                        const sizeStyle: React.CSSProperties = {
                            width: iconSize,
                            height: iconSize,
                            transform: scale !== 1 ? `scale(${scale})` : undefined,
                            transformOrigin: position === 'bottom' ? 'center bottom' : position === 'top' ? 'center top' : position === 'left' ? 'left center' : 'right center',
                        };
                        const itemElement = (
                            <Component
                                key={item.id}
                                ref={(el: HTMLButtonElement & HTMLAnchorElement) => {
                                    itemRefs.current[index] = el;
                                }}
                                className={classNames('eui-dock-item', {
                                    'eui-dock-item-disabled': item.disabled,
                                })}
                                style={sizeStyle}
                                href={item.href}
                                aria-label={item.label || item.id}
                                aria-disabled={item.disabled || undefined}
                                tabIndex={item.disabled ? -1 : 0}
                                onClick={() => handleItemActivate(item)}
                                onKeyDown={(e: React.KeyboardEvent) => handleKey(e, index)}
                                onFocus={() => handleFocus(index)}
                                onBlur={handleBlur}
                                onMouseEnter={(e: React.MouseEvent) => item.label && handleTooltipShow(e, item.label)}
                                onMouseLeave={handleTooltipHide}
                                {...(Component === 'button' ? { type: 'button' } : {})}
                            >
                                <Icon icon={item.icon} className="eui-dock-item-icon" aria-hidden="true" />
                                {item.badge != null && <span className="eui-dock-item-badge" aria-hidden="true">{item.badge}</span>}
                            </Component>
                        );

                        return (
                            <React.Fragment key={item.id}>
                                {itemElement}
                                {item.separatorAfter && <span className="eui-dock-separator" role="separator" aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'} />}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {mode === 'fixed' && autoHide && hidden && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        zIndex: 49,
                        background: 'transparent',
                        ...(position === 'bottom' && { bottom: 0, left: 0, right: 0, height: triggerZone }),
                        ...(position === 'top' && { top: 0, left: 0, right: 0, height: triggerZone }),
                        ...(position === 'left' && { left: 0, top: 0, bottom: 0, width: triggerZone }),
                        ...(position === 'right' && { right: 0, top: 0, bottom: 0, width: triggerZone }),
                    }}
                    onPointerEnter={() => setHidden(false)}
                />
            )}
        </>
    );
};

export { Dock };
export default Dock;
