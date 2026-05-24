import classNames from 'classnames';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TimesIcon } from '../assets/icons';
import { useClickOutside } from '../hooks/useClickOutside';
import { useKeyboard } from '../hooks/useKeyboard';
import { useViewport } from '../hooks/useMobile';
import { usePosition } from '../hooks/usePosition';
import { BaseComponentProps, ListItem, ListItemGroup } from '../types';
import { generateId, getComponentClasses } from '../utils';
import Icon from './Icon';
import './eui-base.scss';
import './Popover.scss';

interface MobileSearchConfig {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

interface PopoverProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: (e?: MouseEvent) => void;
    triggerElement: HTMLElement | null;
    items: ListItem[];
    groups?: ListItemGroup[];
    onSelect: (item: ListItem, index: number) => void;
    selectedIndex?: number;
    renderItem?: (item: ListItem, index: number, isSelected: boolean, isHighlighted: boolean) => React.ReactNode;
    maxHeight?: string;
    width?: string;
    filter?: string;
    loading?: boolean;
    emptyMessage?: string;
    children?: any;
    mobileTitle?: string;
    mobileSearch?: MobileSearchConfig;
    hideChildrenOnMobile?: boolean;
    footer?: React.ReactNode;
    listboxId?: string;
    onHighlightChange?: (index: number, optionId: string | null) => void;
}

export const Popover = ({
    isOpen,
    onClose,
    triggerElement,
    items,
    groups,
    onSelect,
    selectedIndex = -1,
    renderItem,
    maxHeight = '300px',
    width,
    filter = '',
    loading = false,
    emptyMessage = 'No items found',
    children,
    mobileTitle = 'Select',
    mobileSearch,
    hideChildrenOnMobile = false,
    footer,
    listboxId: listboxIdProp,
    onHighlightChange,
    ...baseProps
}: PopoverProps) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLInputElement>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isVisible, setIsVisible] = useState(false);
    const { position, calculatePosition } = usePosition();
    const { isMobile, isTablet, isCompact } = useViewport();
    const internalIdRef = useRef<string>('');
    if (!internalIdRef.current) internalIdRef.current = generateId();
    const listboxId = listboxIdProp || `${internalIdRef.current}-listbox`;
    const optionId = (i: number) => `${listboxId}-option-${i}`;

    const filteredItems = useMemo(
        () => items.filter((item) => !filter || item.label.toLowerCase().includes(filter.toLowerCase())),
        [items, filter],
    );

    const filteredGroups = useMemo(
        () =>
            groups
                ? groups
                      .map((group) => ({
                          ...group,
                          items: group.items.filter((item) => !filter || item.label.toLowerCase().includes(filter.toLowerCase())),
                      }))
                      .filter((group) => group.items.length > 0)
                : undefined,
        [groups, filter],
    );

    useClickOutside(popoverRef, onClose, isOpen && !isCompact);

    useEffect(() => {
        if (onHighlightChange) {
            const id = highlightedIndex >= 0 && highlightedIndex < filteredItems.length ? optionId(highlightedIndex) : null;
            onHighlightChange(highlightedIndex, id);
        }
    }, [highlightedIndex, filteredItems.length, onHighlightChange]);

    useKeyboard(
        {
            Escape: onClose,
            ArrowDown: () => {
                if (filteredItems.length === 0) return;
                setHighlightedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
            },
            ArrowUp: () => {
                if (filteredItems.length === 0) return;
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
            },
            Home: () => {
                if (filteredItems.length === 0) return;
                setHighlightedIndex(0);
            },
            End: () => {
                if (filteredItems.length === 0) return;
                setHighlightedIndex(filteredItems.length - 1);
            },
            Enter: () => {
                if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
                    const item = filteredItems[highlightedIndex];
                    if (!item.disabled) {
                        onSelect(item, highlightedIndex);
                    }
                }
            },
        },
        isOpen,
    );

    useLayoutEffect(() => {
        if (!popoverRef.current || !triggerElement) {
            setIsVisible(false);
            return;
        }

        if (!isOpen) {
            setIsVisible(false);
            return;
        }

        if (isCompact) {
            setIsVisible(true);
            return;
        }

        calculatePosition(triggerElement, popoverRef.current);

        const rafId = requestAnimationFrame(() => {
            if (popoverRef.current && triggerElement) {
                calculatePosition(triggerElement, popoverRef.current);
                setIsVisible(true);
            }
        });

        return () => cancelAnimationFrame(rafId);
    }, [isOpen, popoverRef.current, triggerElement, calculatePosition, isCompact]);

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [filter]);

    useEffect(() => {
        if (isOpen) {
            setHighlightedIndex(selectedIndex);
        }
    }, [isOpen, selectedIndex]);

    useEffect(() => {
        if (!isOpen || !isCompact) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, isCompact]);

    useEffect(() => {
        if (!isOpen || !isCompact || !mobileSearch) return;
        const id = window.setTimeout(() => mobileSearchRef.current?.focus(), 60);
        return () => window.clearTimeout(id);
    }, [isOpen, isCompact, mobileSearch]);

    useEffect(() => {
        if (!listRef.current || !popoverRef.current || highlightedIndex < 0 || !isVisible) {
            return;
        }

        const listElement = listRef.current;
        const scrollContainer = listElement.parentElement || popoverRef.current;
        const itemElement = listElement.querySelector(`[data-popover-index="${highlightedIndex}"]`) as HTMLElement | null;

        if (!itemElement) {
            return;
        }

        const itemTop = itemElement.offsetTop;
        const itemBottom = itemTop + itemElement.offsetHeight;
        const scrollTop = scrollContainer.scrollTop;
        const scrollBottom = scrollTop + scrollContainer.clientHeight;

        if (itemTop < scrollTop) {
            scrollContainer.scrollTop = itemTop;
        } else if (itemBottom > scrollBottom) {
            scrollContainer.scrollTop = itemBottom - scrollContainer.clientHeight;
        }
    }, [highlightedIndex, isVisible]);

    if (!isOpen) {
        return null;
    }

    const componentClasses = getComponentClasses(
        baseProps,
        classNames('eui-popover', {
            'eui-popover-mobile': isMobile,
            'eui-popover-tablet': isTablet,
            'eui-popover-compact': isCompact,
        }),
    );

    const componentStyles = isCompact
        ? { opacity: isVisible ? 1 : 0 }
        : {
              opacity: isVisible ? 1 : 0,
              top: position.top,
              left: position.left,
              width: width || triggerElement?.offsetWidth || 'auto',
              maxHeight,
          };

    const handleBackdropClick = () => {
        onClose();
    };

    const handleStopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    };

    const defaultRenderItem = (item: ListItem, index: number, isSelected: boolean, isHighlighted: boolean) => {
        const itemIcon = item.icon;
        return (
            <div
                className={classNames('eui-popover-item', {
                    'eui-popover-item-highlighted': isHighlighted && !item.disabled,
                    'eui-popover-item-selected': isSelected,
                    'eui-popover-item-disabled': item.disabled,
                })}
                onClick={() => !item.disabled && onSelect(item, index)}
                onMouseEnter={() => !item.disabled && setHighlightedIndex(index)}
            >
                {!!itemIcon && <Icon icon={itemIcon} className="eui-popover-item-icon" />}
                <span className="eui-popover-item-label">{item.label}</span>
                {isSelected && (
                    <svg
                        className="eui-popover-item-check"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </div>
        );
    };

    const listInner = (
        <div ref={listRef} className="eui-popover-list" id={listboxId} role="listbox" aria-label="Options">
            {filteredGroups
                ? filteredGroups.map((group) => {
                      const groupIcon = group.icon;
                      return (
                          <div key={group.label} role="group" aria-label={group.label}>
                              <div className="eui-popover-group-header">
                                  {!!groupIcon && <Icon icon={groupIcon} />}
                                  <span>{group.label}</span>
                              </div>
                              {group.items.map((item) => {
                                  const flatIndex = filteredItems.indexOf(item);
                                  return (
                                      <div
                                          key={flatIndex}
                                          id={optionId(flatIndex)}
                                          role="option"
                                          aria-selected={flatIndex === selectedIndex}
                                          aria-disabled={item.disabled || undefined}
                                          data-popover-index={flatIndex}
                                      >
                                          {renderItem
                                              ? renderItem(
                                                    item,
                                                    flatIndex,
                                                    flatIndex === selectedIndex,
                                                    flatIndex === highlightedIndex,
                                                )
                                              : defaultRenderItem(
                                                    item,
                                                    flatIndex,
                                                    flatIndex === selectedIndex,
                                                    flatIndex === highlightedIndex,
                                                )}
                                      </div>
                                  );
                              })}
                          </div>
                      );
                  })
                : filteredItems.map((item, index) => (
                      <div
                          key={index}
                          id={optionId(index)}
                          role="option"
                          aria-selected={index === selectedIndex}
                          aria-disabled={item.disabled || undefined}
                          data-popover-index={index}
                      >
                          {renderItem
                              ? renderItem(item, index, index === selectedIndex, index === highlightedIndex)
                              : defaultRenderItem(item, index, index === selectedIndex, index === highlightedIndex)}
                      </div>
                  ))}
        </div>
    );

    const listContent = loading ? (
        <div className="eui-popover-loading">
            <div className="eui-popover-spinner" aria-hidden="true" />
            <span>Loading...</span>
        </div>
    ) : filteredItems.length === 0 ? (
        <div className="eui-popover-empty">{emptyMessage}</div>
    ) : (
        listInner
    );

    if (isCompact) {
        return createPortal(
            <div
                className={classNames('eui-popover-backdrop', {
                    'eui-popover-backdrop-tablet': isTablet,
                    'eui-popover-backdrop-mobile': isMobile,
                })}
                onClick={handleBackdropClick}
            >
                <div
                    ref={popoverRef}
                    className={componentClasses}
                    style={componentStyles}
                    role="dialog"
                    aria-modal="true"
                    aria-label={mobileTitle}
                    onClick={handleStopPropagation}
                >
                    <div className="eui-popover-mobile-header">
                        <span className="eui-popover-mobile-title">{mobileTitle}</span>
                        <button
                            type="button"
                            className="eui-popover-mobile-close"
                            onClick={() => onClose()}
                            aria-label="Close"
                        >
                            <TimesIcon />
                        </button>
                    </div>
                    {mobileSearch && (
                        <div className="eui-popover-mobile-search">
                            <input
                                ref={mobileSearchRef}
                                type="text"
                                value={mobileSearch.value}
                                onChange={(e) => mobileSearch.onChange(e.target.value)}
                                placeholder={mobileSearch.placeholder || 'Search...'}
                                className="eui-popover-mobile-search-input"
                                aria-label="Search options"
                                aria-controls={listboxId}
                            />
                        </div>
                    )}
                    {!hideChildrenOnMobile && children}
                    <div className="eui-popover-mobile-body">{listContent}</div>
                    {footer && <div className="eui-popover-mobile-footer">{footer}</div>}
                </div>
            </div>,
            document.body,
        );
    }

    return createPortal(
        <div ref={popoverRef} className={componentClasses} style={componentStyles}>
            {children}
            {listContent}
            {footer && <div className="eui-popover-footer">{footer}</div>}
        </div>,
        document.body,
    );
};
