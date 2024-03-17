import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Breadcrumb.scss';

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    maxItems?: number;
    className?: string;
    onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const BreadcrumbSeparator: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="eui-breadcrumb-separator" aria-hidden="true">
        {children}
    </li>
);

const BreadcrumbItemRenderer: React.FC<{
    item: BreadcrumbItem;
    index: number;
    isLast: boolean;
    onItemClick?: (item: BreadcrumbItem, index: number) => void;
}> = ({ item, index, isLast, onItemClick }) => {
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (item.onClick) {
                e.preventDefault();
                item.onClick();
            }
            onItemClick?.(item, index);
        },
        [item, index, onItemClick],
    );

    const content = (
        <>
            {item.icon && <span className="eui-breadcrumb-icon">{item.icon}</span>}
            <span>{item.label}</span>
        </>
    );

    if (isLast) {
        return (
            <li className="eui-breadcrumb-item eui-breadcrumb-item-active" aria-current="page">
                <span className="eui-breadcrumb-link eui-breadcrumb-link-current">{content}</span>
            </li>
        );
    }

    if (item.href) {
        return (
            <li className="eui-breadcrumb-item">
                <a className="eui-breadcrumb-link" href={item.href} onClick={handleClick}>
                    {content}
                </a>
            </li>
        );
    }

    return (
        <li className="eui-breadcrumb-item">
            <button type="button" className="eui-breadcrumb-link" onClick={handleClick}>
                {content}
            </button>
        </li>
    );
};

const CollapsedItems: React.FC<{
    items: BreadcrumbItem[];
    startIndex: number;
    onItemClick?: (item: BreadcrumbItem, index: number) => void;
}> = ({ items, startIndex, onItemClick }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (!open) return;

        const handleOutsideClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [open]);

    const handleDropdownItemClick = useCallback(
        (item: BreadcrumbItem, actualIndex: number) => {
            if (item.onClick) {
                item.onClick();
            }
            onItemClick?.(item, actualIndex);
            setOpen(false);
        },
        [onItemClick],
    );

    return (
        <li className="eui-breadcrumb-item eui-breadcrumb-collapsed" ref={containerRef}>
            <button
                type="button"
                className="eui-breadcrumb-link eui-breadcrumb-ellipsis"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label="Show collapsed breadcrumb items"
            >
                &hellip;
            </button>
            {open && (
                <ul className="eui-breadcrumb-dropdown" role="menu">
                    {items.map((item, i) => {
                        const actualIndex = startIndex + i;
                        return (
                            <li key={actualIndex} className="eui-breadcrumb-dropdown-item" role="menuitem">
                                {item.href ? (
                                    <a
                                        className="eui-breadcrumb-dropdown-link"
                                        href={item.href}
                                        onClick={(e) => {
                                            if (item.onClick) {
                                                e.preventDefault();
                                            }
                                            handleDropdownItemClick(item, actualIndex);
                                        }}
                                    >
                                        {item.icon && <span className="eui-breadcrumb-icon">{item.icon}</span>}
                                        <span>{item.label}</span>
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        className="eui-breadcrumb-dropdown-link"
                                        onClick={() => handleDropdownItemClick(item, actualIndex)}
                                    >
                                        {item.icon && <span className="eui-breadcrumb-icon">{item.icon}</span>}
                                        <span>{item.label}</span>
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, separator = '/', maxItems, className, onItemClick }) => {
    const visibleItems = useMemo(() => {
        if (!maxItems || maxItems >= items.length || items.length <= 2) {
            return { before: items, collapsed: [], after: [], hasCollapsed: false };
        }

        const firstCount = 1;
        const lastCount = Math.max(1, maxItems - 1);
        const before = items.slice(0, firstCount);
        const after = items.slice(items.length - lastCount);
        const collapsed = items.slice(firstCount, items.length - lastCount);

        return { before, collapsed, after, hasCollapsed: collapsed.length > 0 };
    }, [items, maxItems]);

    if (items.length === 0) return null;

    const renderItems = () => {
        const elements: React.ReactNode[] = [];

        const addSeparator = (key: string) => {
            elements.push(<BreadcrumbSeparator key={key}>{separator}</BreadcrumbSeparator>);
        };

        visibleItems.before.forEach((item, i) => {
            if (i > 0) addSeparator(`sep-before-${i}`);
            elements.push(
                <BreadcrumbItemRenderer
                    key={`before-${i}`}
                    item={item}
                    index={i}
                    isLast={!visibleItems.hasCollapsed && i === items.length - 1}
                    onItemClick={onItemClick}
                />,
            );
        });

        if (visibleItems.hasCollapsed) {
            addSeparator('sep-collapsed-start');
            elements.push(
                <CollapsedItems
                    key="collapsed"
                    items={visibleItems.collapsed}
                    startIndex={visibleItems.before.length}
                    onItemClick={onItemClick}
                />,
            );
            addSeparator('sep-collapsed-end');

            visibleItems.after.forEach((item, i) => {
                if (i > 0) addSeparator(`sep-after-${i}`);
                const actualIndex = items.length - visibleItems.after.length + i;
                elements.push(
                    <BreadcrumbItemRenderer
                        key={`after-${i}`}
                        item={item}
                        index={actualIndex}
                        isLast={actualIndex === items.length - 1}
                        onItemClick={onItemClick}
                    />,
                );
            });
        }

        return elements;
    };

    return (
        <nav className={classNames('eui-breadcrumb', className)} aria-label="Breadcrumb">
            <ol className="eui-breadcrumb-list">{renderItems()}</ol>
        </nav>
    );
};

export { Breadcrumb };
export type { BreadcrumbItem, BreadcrumbProps };
