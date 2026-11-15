import classNames from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TabHeader } from './TabHeader';
import { TabOverflowMenu } from './TabOverflowMenu';
import type { TabViewVariant } from './TabView';
import { isTabDisabled } from './tabview-utils';

interface TabNavProps {
    tabs: React.ReactElement[];
    activeIndex: number;
    position: 'top' | 'bottom' | 'left' | 'right';
    scrollable: boolean;
    variant?: TabViewVariant;
    onTabClick: (index: number, tab: React.ReactElement) => void;
    onTabClose?: (index: number, tab: React.ReactElement) => void;
    headerEnd?: React.ReactNode;
    className?: string;
    baseId: string;
    activationMode?: 'auto' | 'manual';
    ariaLabel?: string;
}

export const TabNav: React.FC<TabNavProps> = ({
    tabs,
    activeIndex,
    position,
    scrollable,
    variant = 'default',
    onTabClick,
    onTabClose,
    headerEnd,
    className,
    baseId,
    activationMode = 'auto',
    ariaLabel,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
    const overflowTriggerRef = useRef<HTMLButtonElement | null>(null);
    const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
    const [indicatorReady, setIndicatorReady] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(activeIndex);
    const hasSlidingIndicator = variant === 'segment' || variant === 'glow';

    useEffect(() => {
        setFocusedIndex(activeIndex);
    }, [activeIndex]);

    const updateIndicator = useCallback(() => {
        if (!hasSlidingIndicator || !scrollContainerRef.current) return;
        const activeEl = tabRefs.current[activeIndex];
        if (!activeEl || hiddenIndices.includes(activeIndex)) {
            setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
            setIndicatorReady(false);
            return;
        }
        setIndicatorStyle({
            width: activeEl.offsetWidth,
            height: activeEl.offsetHeight,
            transform: `translate(${activeEl.offsetLeft}px, ${activeEl.offsetTop}px)`,
        });
        setIndicatorReady(true);
    }, [activeIndex, hasSlidingIndicator, hiddenIndices]);

    useEffect(() => {
        updateIndicator();
    }, [updateIndicator, tabs.length]);

    useEffect(() => {
        if (!hasSlidingIndicator) return;
        const container = scrollContainerRef.current;
        if (!container) return;
        if (typeof ResizeObserver === 'undefined') {
            const handleResize = () => updateIndicator();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
        const ro = new ResizeObserver(() => updateIndicator());
        ro.observe(container);
        return () => ro.disconnect();
    }, [hasSlidingIndicator, updateIndicator]);

    const isVertical = position === 'left' || position === 'right';
    const tabCount = tabs.length;

    const measureOverflow = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container || !scrollable) {
            setHiddenIndices((prev) => (prev.length === 0 ? prev : []));
            return;
        }

        const limit = isVertical ? container.clientHeight : container.clientWidth;
        const next: number[] = [];
        tabRefs.current.forEach((el, index) => {
            if (!el || index >= tabCount) return;
            const end = isVertical ? el.offsetTop + el.offsetHeight : el.offsetLeft + el.offsetWidth;
            if (end > limit + 1) next.push(index);
        });

        setHiddenIndices((prev) => (prev.length === next.length && prev.every((value, i) => value === next[i]) ? prev : next));
    }, [scrollable, isVertical, tabCount]);

    const hasOverflow = hiddenIndices.length > 0;

    useLayoutEffect(() => {
        measureOverflow();
    }, [measureOverflow, tabs, hasOverflow, activeIndex]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || !scrollable || typeof ResizeObserver === 'undefined') return;

        const resizeObserver = new ResizeObserver(() => measureOverflow());
        resizeObserver.observe(container);
        tabRefs.current.forEach((el) => {
            if (el) resizeObserver.observe(el);
        });

        return () => resizeObserver.disconnect();
    }, [scrollable, measureOverflow, tabCount]);

    const hiddenSet = useMemo(() => new Set(hiddenIndices), [hiddenIndices]);
    const overflowItems = useMemo(
        () => hiddenIndices.filter((index) => !!tabs[index]).map((index) => ({ index, tab: tabs[index] })),
        [hiddenIndices, tabs],
    );

    const setOverflowTrigger = useCallback((el: HTMLButtonElement | null) => {
        overflowTriggerRef.current = el;
    }, []);

    const focusTab = (index: number) => {
        const target = tabRefs.current[index];
        target?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        let nextIndex = index;
        let isNavKey = false;

        if ((e.key === 'ArrowLeft' && !isVertical) || (e.key === 'ArrowUp' && isVertical)) {
            e.preventDefault();
            nextIndex = index - 1;
            isNavKey = true;
        } else if ((e.key === 'ArrowRight' && !isVertical) || (e.key === 'ArrowDown' && isVertical)) {
            e.preventDefault();
            nextIndex = index + 1;
            isNavKey = true;
        } else if (e.key === 'Home') {
            e.preventDefault();
            nextIndex = 0;
            isNavKey = true;
        } else if (e.key === 'End') {
            e.preventDefault();
            nextIndex = tabs.length - 1;
            isNavKey = true;
        }

        if (isNavKey && nextIndex !== index) {
            const direction = nextIndex > index ? 1 : -1;
            while (nextIndex >= 0 && nextIndex < tabs.length && isTabDisabled(tabs[nextIndex])) {
                nextIndex += direction;
            }

            if (nextIndex >= 0 && nextIndex < tabs.length) {
                if (activationMode === 'auto') {
                    onTabClick(nextIndex, tabs[nextIndex]);
                } else {
                    setFocusedIndex(nextIndex);
                }
                const targetIndex = nextIndex;
                requestAnimationFrame(() => {
                    if (hiddenSet.has(targetIndex)) {
                        overflowTriggerRef.current?.focus();
                    } else {
                        focusTab(targetIndex);
                    }
                });
            }
        }
    };

    const containerClasses = classNames(
        'eui-tab-nav-container',
        `eui-tab-nav-${position}`,
        variant !== 'default' && `eui-tab-nav-${variant}`,
        {
            'eui-tab-nav-horizontal': !isVertical,
            'eui-tab-nav-vertical': isVertical,
        },
        className
    );

    const scrollContainerClasses = classNames('eui-tab-scroll-container', {
        'eui-tab-scroll-vertical': isVertical,
        'eui-tab-scroll-horizontal': !isVertical,
        'eui-tab-scroll-hidden': scrollable,
        'eui-tab-scroll-fit': scrollable,
        'eui-tab-scroll-x': !scrollable && !isVertical,
        'eui-tab-scroll-y': !scrollable && isVertical,
        'eui-tab-scroll-wrap': !scrollable && !isVertical,
    });

    const tabbableIndex = activationMode === 'manual' ? focusedIndex : activeIndex;
    const orientation: 'horizontal' | 'vertical' = isVertical ? 'vertical' : 'horizontal';

    const handleOverflowTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (hiddenSet.has(tabbableIndex)) handleKeyDown(e, tabbableIndex);
    };

    return (
        <div className={containerClasses}>
            <div
                ref={scrollContainerRef}
                className={scrollContainerClasses}
                role="tablist"
                aria-label={ariaLabel}
                aria-orientation={orientation}
                style={{ position: hasSlidingIndicator || scrollable ? 'relative' : undefined }}
            >
                {hasSlidingIndicator && (
                    <div
                        className={classNames('eui-tab-segment-indicator', {
                            'eui-tab-segment-indicator-glow': variant === 'glow',
                            'eui-tab-segment-indicator-ready': indicatorReady,
                        })}
                        style={indicatorStyle}
                        aria-hidden="true"
                    />
                )}
                {tabs.map((tab, index) => {
                    const tabProps = tab.props as Record<string, unknown>;
                    const tabId = `${baseId}-tab-${index}`;
                    const panelId = `${baseId}-panel-${index}`;
                    return (
                        <TabHeader
                            key={index}
                            id={tabId}
                            panelId={panelId}
                            header={tabProps.header as React.ReactNode}
                            leftIcon={tabProps.leftIcon as React.ComponentProps<typeof TabHeader>['leftIcon']}
                            rightIcon={tabProps.rightIcon as React.ComponentProps<typeof TabHeader>['rightIcon']}
                            active={index === activeIndex}
                            disabled={isTabDisabled(tab)}
                            closable={tabProps.closable as boolean | undefined}
                            onClick={() => onTabClick(index, tab)}
                            onClose={() => onTabClose?.(index, tab)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            tabIndex={index === tabbableIndex ? 0 : -1}
                            overflowed={hiddenSet.has(index)}
                            position={position}
                            variant={variant}
                            tabRef={(el) => { tabRefs.current[index] = el; }}
                        />
                    );
                })}
            </div>

            {scrollable && overflowItems.length > 0 && (
                <TabOverflowMenu
                    items={overflowItems}
                    activeIndex={activeIndex}
                    position={position}
                    variant={variant}
                    onSelect={onTabClick}
                    onClose={onTabClose}
                    onTriggerKeyDown={handleOverflowTriggerKeyDown}
                    triggerRef={setOverflowTrigger}
                />
            )}

            {headerEnd && !isVertical && (
                <div className="eui-tab-header-end">{headerEnd}</div>
            )}
        </div>
    );
};
