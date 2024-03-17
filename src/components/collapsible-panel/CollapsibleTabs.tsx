import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './collapsible-panel.scss';

export interface CollapsibleTabItem {
    id: string;
    label: string;
    isOpen?: boolean;
    render: (props: CollapsibleTabRenderProps) => React.ReactNode;
}

export interface CollapsibleTabRenderProps {
    index: number;
    isOpen: boolean;
    totalOpen: number;
    maxWidth?: string;
}

export type CollapsibleTabsVariant = 'default' | 'bordered' | 'elevated';

export interface CollapsibleTabsProps {
    tabs: CollapsibleTabItem[];
    height?: number | string;
    minOpenTabs?: number;
    variant?: CollapsibleTabsVariant;
    className?: string;
    style?: React.CSSProperties;
    onTabToggle?: (tabId: string, isOpen: boolean) => void;
}

const plusIcon = (
    <svg className="eui-ct-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
);

const minusIcon = (
    <svg className="eui-ct-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clipRule="evenodd" />
    </svg>
);

function getAvailableWidth(totalOpen: number, openTabs: boolean[], tabsCount: number): string {
    const openTabsMargin = 12 * openTabs.reduce((acc, isOpen, index) => (isOpen && index && openTabs[index - 1] ? acc + 1 : 0), 0);
    const totalRequiredByCollapsed = parseFloat((((tabsCount - totalOpen) * 40 + openTabsMargin) / totalOpen).toFixed(2));
    const maxWidth = parseFloat((100 / totalOpen).toFixed(2));
    return `calc(${maxWidth}% - ${totalRequiredByCollapsed}px)`;
}

export const CollapsibleTabs: React.FC<CollapsibleTabsProps> = ({
    tabs,
    height,
    minOpenTabs = 1,
    variant = 'default',
    className,
    style,
    onTabToggle,
}) => {
    const [openTabs, setOpenTabs] = useState<boolean[]>(() => tabs.map((t) => t.isOpen ?? true));
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 1024px)');
        const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsLargeScreen(e.matches);
        handler(mql);
        mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
        return () => mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
    }, []);

    const toggleTab = useCallback(
        (index: number) => {
            setOpenTabs((prev) => {
                const openCount = prev.filter(Boolean).length;
                if (openCount <= minOpenTabs && prev[index]) return prev;
                const next = prev.map((isOpen, i) => (i === index ? !isOpen : isOpen));
                onTabToggle?.(tabs[index].id, next[index]);
                return next;
            });
        },
        [minOpenTabs, tabs, onTabToggle],
    );

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTab(index);
            }
        },
        [toggleTab],
    );

    const totalOpen = openTabs.filter(Boolean).length;

    const rootStyles = useMemo<React.CSSProperties>(() => {
        const h = typeof height === 'number' ? `${height}px` : height;
        return { ...style, ...(h ? { minHeight: h } : {}) };
    }, [style, height]);

    const getTabStyle = useCallback(
        (isOpen: boolean): { maxWidth?: string } => {
            if (!isOpen || !isLargeScreen) return {};
            return { maxWidth: getAvailableWidth(totalOpen, openTabs, tabs.length) };
        },
        [isLargeScreen, totalOpen, openTabs, tabs.length],
    );

    return (
        <div
            ref={containerRef}
            className={classNames('eui-collapsible-tabs', `eui-ct-${variant}`, className)}
            style={rootStyles}
            role="tablist"
            aria-orientation={isLargeScreen ? 'horizontal' : 'vertical'}
        >
            {tabs.map((tab, index) => {
                const isOpen = openTabs[index];
                const tabStyle = getTabStyle(isOpen);

                return (
                    <div
                        key={tab.id}
                        className={classNames('eui-ct-tab', {
                            'eui-ct-tab-open': isOpen,
                            'eui-ct-tab-closed': !isOpen,
                            'eui-ct-tab-has-open-sibling':
                                index > 0 && isOpen && openTabs[index - 1],
                        })}
                        style={tabStyle}
                    >
                        {!isOpen && (
                            <div
                                className="eui-ct-collapsed-header"
                                role="tab"
                                tabIndex={0}
                                aria-selected={false}
                                aria-label={`Expand ${tab.label}`}
                                onClick={() => toggleTab(index)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                            >
                                <span className="eui-ct-expand-icon">{plusIcon}</span>
                                <span className="eui-ct-collapsed-label">{tab.label}</span>
                            </div>
                        )}
                        {isOpen && (
                            <div className="eui-ct-open-content" role="tabpanel">
                                {totalOpen > minOpenTabs && (
                                    <div
                                        className="eui-ct-collapse-btn"
                                        role="tab"
                                        tabIndex={0}
                                        aria-selected
                                        aria-label={`Collapse ${tab.label}`}
                                        onClick={() => toggleTab(index)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                    >
                                        <span className="eui-ct-collapse-icon">{minusIcon}</span>
                                    </div>
                                )}
                                <div className="eui-ct-panel-body">
                                    {tab.render({ index, isOpen, totalOpen, maxWidth: tabStyle.maxWidth })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

CollapsibleTabs.displayName = 'CollapsibleTabs';
