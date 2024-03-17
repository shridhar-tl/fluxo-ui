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
}

export const TabNav: React.FC<TabNavProps> = ({ tabs, activeIndex, position, scrollable, variant = 'default', onTabClick, onTabClose, headerEnd, className }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
    const isSegment = variant === 'segment';

    const updateIndicator = useCallback(() => {
        if (!isSegment || !scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const activeEl = container.children[activeIndex] as HTMLElement;
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

    const isVertical = position === 'left' || position === 'right';

    const checkScrollButtons = () => {
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
    };

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

    const ensureActiveTabVisible = () => {
        if (!scrollContainerRef.current || !scrollable) return;

        const container = scrollContainerRef.current;
        const activeTab = container.children[activeIndex] as HTMLElement;

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
    };

    useEffect(() => {
        checkScrollButtons();
        ensureActiveTabVisible();
    }, [activeIndex, tabs.length]);

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
    }, [scrollable]);

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        let nextIndex = index;

        if ((e.key === 'ArrowLeft' && !isVertical) || (e.key === 'ArrowUp' && isVertical)) {
            e.preventDefault();
            nextIndex = index - 1;
        } else if ((e.key === 'ArrowRight' && !isVertical) || (e.key === 'ArrowDown' && isVertical)) {
            e.preventDefault();
            nextIndex = index + 1;
        } else if (e.key === 'Home') {
            e.preventDefault();
            nextIndex = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            nextIndex = tabs.length - 1;
        }

        if (nextIndex !== index) {
            while (nextIndex >= 0 && nextIndex < tabs.length && isTabDisabled(tabs[nextIndex])) {
                nextIndex += nextIndex > index ? 1 : -1;
            }

            if (nextIndex >= 0 && nextIndex < tabs.length) {
                onTabClick(nextIndex, tabs[nextIndex]);
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

    return (
        <div className={containerClasses}>
            {scrollable && showLeftArrow && (
                <button
                    className={classNames('eui-tab-arrow', {
                        'eui-tab-arrow-left': !isVertical,
                        'eui-tab-arrow-up': isVertical,
                    })}
                    onClick={() => scrollToTab('left')}
                    aria-label={isVertical ? 'Scroll up' : 'Scroll left'}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isVertical ? <polyline points="18 15 12 9 6 15" /> : <polyline points="15 18 9 12 15 6" />}
                    </svg>
                </button>
            )}

            <div
                ref={scrollContainerRef}
                className={scrollContainerClasses}
                role="tablist"
                style={{
                    paddingLeft: scrollable && showLeftArrow && !isVertical ? '2rem' : undefined,
                    paddingRight: scrollable && showRightArrow && !isVertical ? '2rem' : undefined,
                    paddingTop: scrollable && showLeftArrow && isVertical ? '2rem' : undefined,
                    paddingBottom: scrollable && showRightArrow && isVertical ? '2rem' : undefined,
                    position: isSegment ? 'relative' : undefined,
                }}
            >
                {isSegment && (
                    <div className="eui-tab-segment-indicator" style={indicatorStyle} />
                )}
                {tabs.map((tab: any, index) => (
                    <TabHeader
                        key={index}
                        header={tab.props.header}
                        leftIcon={tab.props.leftIcon}
                        rightIcon={tab.props.rightIcon}
                        active={index === activeIndex}
                        disabled={isTabDisabled(tab)}
                        closable={tab.props.closable}
                        onClick={() => onTabClick(index, tab)}
                        onClose={() => onTabClose?.(index, tab)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        tabIndex={index === activeIndex ? 0 : -1}
                        position={position}
                        variant={variant}
                    />
                ))}
            </div>

            {scrollable && showRightArrow && (
                <button
                    className={classNames('eui-tab-arrow', {
                        'eui-tab-arrow-right': !isVertical,
                        'eui-tab-arrow-down': isVertical,
                    })}
                    onClick={() => scrollToTab('right')}
                    aria-label={isVertical ? 'Scroll down' : 'Scroll right'}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
