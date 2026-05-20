import React, { useCallback, useEffect, useId, useState } from 'react';

import classNames from 'classnames';
import './tab-view.scss';

import { TabNav } from './TabNav';
import { TabPage } from './TabPage';
import { getVisibleTabs, isTabDisabled } from './tabview-utils';

export interface TabChangeEvent {
    originalEvent: React.MouseEvent | React.KeyboardEvent | null;
    index: number;
    tab: React.ReactElement;
}

export interface TabCloseEvent {
    index: number;
    tab: React.ReactElement;
}

export type TabViewVariant = 'default' | 'pills' | 'enclosed' | 'segment' | 'editor' | 'thick-border' | 'elevated' | 'glow';

export interface TabViewProps {
    activeIndex?: number;
    onTabChange?: (e: TabChangeEvent) => void;
    onBeforeTabChange?: (e: TabChangeEvent) => boolean | Promise<boolean>;
    onTabClose?: (e: TabCloseEvent) => void;
    headerEnd?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    scrollable?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    variant?: TabViewVariant;
    preMount?: boolean;
    activationMode?: 'auto' | 'manual';
    ariaLabel?: string;
    children?: React.ReactNode;
}

export const TabView: React.FC<TabViewProps> = ({
    activeIndex: propActiveIndex = 0,
    onTabChange,
    onBeforeTabChange,
    onTabClose,
    headerEnd,
    className,
    style,
    scrollable = false,
    position = 'top',
    variant = 'default',
    preMount = false,
    activationMode = 'auto',
    ariaLabel,
    children,
}) => {
    const [activeIndex, setActiveIndex] = useState(propActiveIndex);
    const visibleTabs = getVisibleTabs(children);
    const generatedId = useId();
    const baseId = `eui-tab-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    useEffect(() => {
        if (propActiveIndex === undefined || propActiveIndex === activeIndex) {
            return;
        }

        let newIndex = propActiveIndex;

        if (newIndex >= visibleTabs.length) {
            newIndex = Math.max(0, visibleTabs.length - 1);
        }

        while (newIndex < visibleTabs.length && isTabDisabled(visibleTabs[newIndex])) {
            newIndex++;
        }

        if (newIndex >= visibleTabs.length) {
            newIndex = propActiveIndex;
            let searchIndex = propActiveIndex - 1;
            while (searchIndex >= 0 && isTabDisabled(visibleTabs[searchIndex])) {
                searchIndex--;
            }
            if (searchIndex >= 0) {
                newIndex = searchIndex;
            }
        }

        setActiveIndex(newIndex);
    }, [propActiveIndex]);

    const handleTabClick = useCallback(
        async (index: number, tab: React.ReactElement, originalEvent: React.MouseEvent | React.KeyboardEvent | null = null) => {
            if (isTabDisabled(tab) || index === activeIndex) {
                return;
            }

            const tabChangeEvent: TabChangeEvent = {
                originalEvent,
                index,
                tab,
            };

            try {
                if (onBeforeTabChange) {
                    const canChange = await onBeforeTabChange(tabChangeEvent);
                    if (!canChange) {
                        return;
                    }
                }

                setActiveIndex(index);
                onTabChange?.(tabChangeEvent);
            } catch (error) {
                console.warn('Error in tab change handler:', error);
            }
        },
        [activeIndex, onBeforeTabChange, onTabChange],
    );

    if (visibleTabs.length === 0) {
        return null;
    }

    const safeActiveIndex = Math.min(Math.max(0, activeIndex), visibleTabs.length - 1);
    const activeTab = visibleTabs[safeActiveIndex];
    if (!activeTab) {
        return null;
    }

    const containerClasses = classNames(
        'eui-tab-view',
        `eui-tab-view-${position}`,
        variant !== 'default' && `eui-tab-view-${variant}`,
        className,
    );

    const contentClasses = classNames('eui-tab-content', {
        'eui-tab-content-order-first': position === 'bottom',
        'eui-tab-content-order-second': position === 'top',
    });

    return (
        <div className={containerClasses} style={style}>
            <TabNav
                tabs={visibleTabs}
                activeIndex={safeActiveIndex}
                position={position}
                scrollable={scrollable}
                variant={variant}
                onTabClick={handleTabClick}
                onTabClose={onTabClose ? (index, tab) => onTabClose({ index, tab }) : undefined}
                headerEnd={headerEnd}
                baseId={baseId}
                activationMode={activationMode}
                ariaLabel={ariaLabel}
                className={classNames({
                    'eui-tab-nav-order-second': position === 'bottom',
                    'eui-tab-nav-order-first': position === 'top' || position === 'left' || position === 'right',
                })}
            />

            <div className={contentClasses}>
                {preMount ? (
                    visibleTabs.map((tab, idx) => (
                        <div
                            key={idx}
                            style={{ display: idx === safeActiveIndex ? undefined : 'none' }}
                            aria-hidden={idx !== safeActiveIndex}
                        >
                            {React.cloneElement(tab, {
                                id: `${baseId}-panel-${idx}`,
                                'aria-labelledby': `${baseId}-tab-${idx}`,
                            } as Record<string, unknown>)}
                        </div>
                    ))
                ) : (
                    React.cloneElement(activeTab, {
                        key: safeActiveIndex,
                        id: `${baseId}-panel-${safeActiveIndex}`,
                        'aria-labelledby': `${baseId}-tab-${safeActiveIndex}`,
                    } as Record<string, unknown>)
                )}
            </div>
        </div>
    );
};

TabView.displayName = 'TabView';

export { TabPage };
