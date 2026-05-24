import classNames from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './eui-base.scss';
import './Breadcrumb.scss';

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

interface BreadcrumbProps extends Omit<React.HTMLAttributes<HTMLElement>, 'className'> {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    maxItems?: number;
    autoCollapse?: boolean;
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
            {item.icon && <span className="eui-breadcrumb-icon" aria-hidden="true">{item.icon}</span>}
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
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLUListElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number; minWidth: number }>({ top: 0, left: 0, minWidth: 0 });

    const computePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            minWidth: rect.width,
        });
    }, []);

    useLayoutEffect(() => {
        if (open) {
            computePosition();
        }
    }, [open, computePosition]);

    useEffect(() => {
        if (!open) return;

        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target)) return;
            if (dropdownRef.current?.contains(target)) return;
            setOpen(false);
        };

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
            }
        };

        const handleScrollResize = () => {
            computePosition();
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKey);
        window.addEventListener('scroll', handleScrollResize, true);
        window.addEventListener('resize', handleScrollResize);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKey);
            window.removeEventListener('scroll', handleScrollResize, true);
            window.removeEventListener('resize', handleScrollResize);
        };
    }, [open, computePosition]);

    useEffect(() => {
        if (open && dropdownRef.current) {
            const first = dropdownRef.current.querySelector<HTMLElement>('[role="menuitem"]');
            first?.focus();
        }
    }, [open]);

    const handleDropdownItemClick = useCallback(
        (item: BreadcrumbItem, actualIndex: number) => {
            if (item.onClick) {
                item.onClick();
            }
            onItemClick?.(item, actualIndex);
            setOpen(false);
            triggerRef.current?.focus();
        },
        [onItemClick],
    );

    const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
        const target = e.target as HTMLElement;
        if (target.getAttribute('role') !== 'menuitem') return;
        const menuItems = Array.from(dropdownRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
        const currentIdx = menuItems.indexOf(target);
        if (currentIdx < 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            menuItems[(currentIdx + 1) % menuItems.length]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            menuItems[(currentIdx - 1 + menuItems.length) % menuItems.length]?.focus();
        } else if (e.key === 'Home') {
            e.preventDefault();
            menuItems[0]?.focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            menuItems[menuItems.length - 1]?.focus();
        }
    };

    const dropdown = open
        ? createPortal(
              <ul
                  ref={dropdownRef}
                  className="eui-breadcrumb-dropdown"
                  role="menu"
                  style={{ top: position.top, left: position.left, minWidth: position.minWidth }}
                  onKeyDown={handleMenuKeyDown}
              >
                  {items.map((item, i) => {
                      const actualIndex = startIndex + i;
                      return (
                          <li key={actualIndex} className="eui-breadcrumb-dropdown-item">
                              {item.href ? (
                                  <a
                                      className="eui-breadcrumb-dropdown-link"
                                      href={item.href}
                                      role="menuitem"
                                      onClick={(e) => {
                                          if (item.onClick) {
                                              e.preventDefault();
                                          }
                                          handleDropdownItemClick(item, actualIndex);
                                      }}
                                  >
                                      {item.icon && <span className="eui-breadcrumb-icon" aria-hidden="true">{item.icon}</span>}
                                      <span>{item.label}</span>
                                  </a>
                              ) : (
                                  <button
                                      type="button"
                                      className="eui-breadcrumb-dropdown-link"
                                      role="menuitem"
                                      onClick={() => handleDropdownItemClick(item, actualIndex)}
                                  >
                                      {item.icon && <span className="eui-breadcrumb-icon" aria-hidden="true">{item.icon}</span>}
                                      <span>{item.label}</span>
                                  </button>
                              )}
                          </li>
                      );
                  })}
              </ul>,
              document.body,
          )
        : null;

    return (
        <li className="eui-breadcrumb-item eui-breadcrumb-collapsed">
            <button
                ref={triggerRef}
                type="button"
                className="eui-breadcrumb-link eui-breadcrumb-ellipsis"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Show collapsed breadcrumb items"
            >
                &hellip;
            </button>
            {dropdown}
        </li>
    );
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    separator = '/',
    maxItems,
    autoCollapse = true,
    className,
    onItemClick,
    ...rest
}) => {
    const navRef = useRef<HTMLElement>(null);
    const measureRef = useRef<HTMLOListElement>(null);
    const [autoMaxItems, setAutoMaxItems] = useState<number | undefined>(undefined);

    const computeFit = useCallback(() => {
        if (!autoCollapse || maxItems !== undefined) return;
        const nav = navRef.current;
        const measure = measureRef.current;
        if (!nav || !measure) return;
        const navWidth = nav.clientWidth;
        const measureWidth = measure.scrollWidth;
        if (measureWidth <= navWidth) {
            if (autoMaxItems !== undefined) setAutoMaxItems(undefined);
            return;
        }
        if (items.length <= 2) {
            if (autoMaxItems !== undefined) setAutoMaxItems(undefined);
            return;
        }
        for (let n = items.length - 1; n >= 2; n--) {
            if (n !== autoMaxItems) {
                setAutoMaxItems(n);
                return;
            }
        }
    }, [autoCollapse, maxItems, items.length, autoMaxItems]);

    useEffect(() => {
        if (!autoCollapse || maxItems !== undefined) return;
        computeFit();
        const ro = new ResizeObserver(() => computeFit());
        if (navRef.current) ro.observe(navRef.current);
        return () => ro.disconnect();
    }, [autoCollapse, maxItems, computeFit]);

    const effectiveMaxItems = maxItems !== undefined ? maxItems : autoMaxItems;

    const visibleItems = useMemo(() => {
        if (!effectiveMaxItems || effectiveMaxItems >= items.length || items.length <= 2) {
            return { before: items, collapsed: [], after: [], hasCollapsed: false };
        }

        const firstCount = 1;
        const lastCount = Math.max(1, effectiveMaxItems - 1);
        const before = items.slice(0, firstCount);
        const after = items.slice(items.length - lastCount);
        const collapsed = items.slice(firstCount, items.length - lastCount);

        return { before, collapsed, after, hasCollapsed: collapsed.length > 0 };
    }, [items, effectiveMaxItems]);

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
        <nav {...rest} ref={navRef} className={classNames('eui-breadcrumb', className)} aria-label={rest['aria-label'] ?? 'Breadcrumb'}>
            <ol className="eui-breadcrumb-list">{renderItems()}</ol>
            {autoCollapse && maxItems === undefined && (
                <ol ref={measureRef} className="eui-breadcrumb-list eui-breadcrumb-list-measure" aria-hidden="true">
                    {items.map((item, idx) => (
                        <React.Fragment key={`measure-${idx}`}>
                            {idx > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
                            <BreadcrumbItemRenderer item={item} index={idx} isLast={idx === items.length - 1} />
                        </React.Fragment>
                    ))}
                </ol>
            )}
        </nav>
    );
};

export { Breadcrumb };
export type { BreadcrumbItem, BreadcrumbProps };
