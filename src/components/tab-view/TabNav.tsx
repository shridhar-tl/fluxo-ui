import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TabHeader } from './TabHeader';
import type { TabViewVariant } from './TabView';
import { calculateScrollPosition, isTabDisabled } from './tabview-utils';

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
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
    const [focusedIndex, setFocusedIndex] = useState(activeIndex);
    const isSegment = variant === 'segment';

    useEffect(() => {
        setFocusedIndex(activeIndex);
    }, [activeIndex]);

    const updateIndicator = useCallback(() => {
        if (!isSegment || !scrollContainerRef.current) return;
        const activeEl = tabRefs.current[activeIndex];
        if (!activeEl) return;
        setIndicatorStyle({
            width: activeEl.offsetWidth,
            height: activeEl.offsetHeight,
            transform: `translateX(${activeEl.offsetLeft}px)`,
        });
    }, [activeIndex, isSegment]);

    useEffect(() => {
        updateIndicator();
    }, [updateIndicator, tabs.length]);

    useEffect(() => {
        if (!isSegment) return;
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
    }, [isSegment, updateIndicator]);

    const isVertical = position === 'left' || position === 'right';

    const checkScrollButtons = useCallback(() => {
        if (!scrollContainerRef.current || !scrollable) return;

        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;
        const scrollWidth = container.scrollWidth;
        const scrollHeight = container.scrollHeight;
        const clientWidth = container.clientWidth;
        const clientHeight = container.clientHeight;

        if (isVertical) {
            setShowLeftArrow(scrollTop > 5);
            setShowRightArrow(scrollTop < scrollHeight - clientHeight - 5);
        } else {
            setShowLeftArrow(scrollLeft > 5);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    }, [scrollable, isVertical]);

    const scrollToTab = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const scrollAmount = isVertical ? 100 : 150;

        if (isVertical) {
            container.scrollTo({
                top: container.scrollTop + (direction === 'right' ? scrollAmount : -scrollAmount),
                behavior: 'smooth',
            });
        } else {
            container.scrollTo({
                left: container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount),
                behavior: 'smooth',
            });
        }
    };

    const ensureActiveTabVisible = useCallback(() => {
        if (!scrollContainerRef.current || !scrollable) return;

        const container = scrollContainerRef.current;
        const activeTab = tabRefs.current[activeIndex];

        if (!activeTab) return;

        if (isVertical) {
            const containerRect = container.getBoundingClientRect();
            const activeRect = activeTab.getBoundingClientRect();

            if (activeRect.top < containerRect.top) {
                container.scrollTo({
                    top: container.scrollTop - (containerRect.top - activeRect.top) - 10,
                    behavior: 'smooth',
                });
            } else if (activeRect.bottom > containerRect.bottom) {
                container.scrollTo({
                    top: container.scrollTop + (activeRect.bottom - containerRect.bottom) + 10,
                    behavior: 'smooth',
                });
            }
        } else {
            const newScrollLeft = calculateScrollPosition(container, activeTab);
            if (newScrollLeft !== container.scrollLeft) {
                container.scrollTo({
                    left: newScrollLeft,
                    behavior: 'smooth',
                });
            }
        }
    }, [activeIndex, isVertical, scrollable]);

    useEffect(() => {
        checkScrollButtons();
        ensureActiveTabVisible();
    }, [activeIndex, tabs.length, checkScrollButtons, ensureActiveTabVisible]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', checkScrollButtons);

        const resizeObserver = new ResizeObserver(() => checkScrollButtons());
        resizeObserver.observe(container);

        return () => {
            container.removeEventListener('scroll', checkScrollButtons);
            resizeObserver.disconnect();
        };
    }, [scrollable, checkScrollButtons]);

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
                requestAnimationFrame(() => focusTab(nextIndex));
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
        'eui-tab-scroll-x': !scrollable && !isVertical,
        'eui-tab-scroll-y': !scrollable && isVertical,
        'eui-tab-scroll-wrap': !scrollable && !isVertical,
    });

    const tabbableIndex = activationMode === 'manual' ? focusedIndex : activeIndex;
    const orientation: 'horizontal' | 'vertical' = isVertical ? 'vertical' : 'horizontal';

    return (
        <div className={containerClasses}>
            {scrollable && showLeftArrow && (
                <button
                    type="button"
                    className={classNames('eui-tab-arrow', {
                        'eui-tab-arrow-left': !isVertical,
                        'eui-tab-arrow-up': isVertical,
                    })}
                    onClick={() => scrollToTab('left')}
                    aria-label={isVertical ? 'Scroll up' : 'Scroll left'}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {isVertical ? <polyline points="18 15 12 9 6 15" /> : <polyline points="15 18 9 12 15 6" />}
                    </svg>
                </button>
            )}

            <div
                ref={scrollContainerRef}
                className={scrollContainerClasses}
                role="tablist"
                aria-label={ariaLabel}
                aria-orientation={orientation}
                style={{
                    paddingLeft: scrollable && showLeftArrow && !isVertical ? '2rem' : undefined,
                    paddingRight: scrollable && showRightArrow && !isVertical ? '2rem' : undefined,
                    paddingTop: scrollable && showLeftArrow && isVertical ? '2rem' : undefined,
                    paddingBottom: scrollable && showRightArrow && isVertical ? '2rem' : undefined,
                    position: isSegment ? 'relative' : undefined,
                }}
            >
                {isSegment && (
                    <div className="eui-tab-segment-indicator" style={indicatorStyle} aria-hidden="true" />
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
                            position={position}
                            variant={variant}
                            tabRef={(el) => { tabRefs.current[index] = el; }}
                        />
                    );
                })}
            </div>

            {scrollable && showRightArrow && (
                <button
                    type="button"
                    className={classNames('eui-tab-arrow', {
                        'eui-tab-arrow-right': !isVertical,
                        'eui-tab-arrow-down': isVertical,
                    })}
                    onClick={() => scrollToTab('right')}
                    aria-label={isVertical ? 'Scroll down' : 'Scroll right'}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {isVertical ? <polyline points="6 9 12 15 18 9" /> : <polyline points="9 18 15 12 9 6" />}
                    </svg>
                </button>
            )}

            {headerEnd && !isVertical && (
                <div className="eui-tab-header-end">{headerEnd}</div>
            )}
        </div>
    );
};
