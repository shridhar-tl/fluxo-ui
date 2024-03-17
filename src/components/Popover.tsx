import classNames from 'classnames';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMobile } from '../hooks/useMobile';
import { usePosition } from '../hooks/usePosition';
import { BaseComponentProps, ListItem, ListItemGroup } from '../types';
import { getComponentClasses } from '../utils';
import Icon from './Icon';
import './Popover.scss';

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
    ...baseProps
}: PopoverProps) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isVisible, setIsVisible] = useState(false);
    const { position, calculatePosition } = usePosition();
    const isMobile = useMobile();

    const filteredItems = items.filter((item) => !filter || item.label.toLowerCase().includes(filter.toLowerCase()));

    const filteredGroups = groups
        ? groups
              .map((group) => ({
                  ...group,
                  items: group.items.filter((item) => !filter || item.label.toLowerCase().includes(filter.toLowerCase())),
              }))
              .filter((group) => group.items.length > 0)
        : undefined;

    useClickOutside(popoverRef, onClose, isOpen);

    useKeyboard(
        {
            Escape: onClose,
            ArrowDown: () => {
                setHighlightedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
            },
            ArrowUp: () => {
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
            },
            Enter: () => {
                if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
                    onSelect(filteredItems[highlightedIndex], highlightedIndex);
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

        calculatePosition(triggerElement, popoverRef.current);

        const rafId = requestAnimationFrame(() => {
            if (popoverRef.current && triggerElement) {
                calculatePosition(triggerElement, popoverRef.current);
                setIsVisible(true);
            }
        });

        return () => cancelAnimationFrame(rafId);
    }, [isOpen, popoverRef.current, triggerElement, calculatePosition]);

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [filter]);

    useEffect(() => {
        if (isOpen) {
            setHighlightedIndex(selectedIndex);
        }
    }, [isOpen, selectedIndex]);

    useEffect(() => {
        if (!listRef.current || !popoverRef.current || highlightedIndex < 0 || !isVisible) {
            return;
        }

        const listElement = listRef.current;
        const scrollContainer = popoverRef.current;
        const itemElement = listElement.children[highlightedIndex] as HTMLElement;

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
        }),
    );

    const componentStyles = {
        opacity: isVisible ? 1 : 0,
        ...(!isMobile && {
            top: position.top,
            left: position.left,
            width: width || triggerElement?.offsetWidth || 'auto',
            maxHeight,
        }),
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
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </div>
        );
    };

    return createPortal(
        <div ref={popoverRef} className={componentClasses} style={componentStyles} role="listbox" aria-label="Options">
            {children}
            {loading ? (
                <div className="eui-popover-loading">
                    <div className="eui-popover-spinner" />
                    <span>Loading...</span>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="eui-popover-empty">{emptyMessage}</div>
            ) : (
                <div ref={listRef} className="eui-popover-list">
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
                                              <div key={flatIndex} role="option" aria-selected={flatIndex === selectedIndex}>
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
                              <div key={index} role="option" aria-selected={index === selectedIndex}>
                                  {renderItem
                                      ? renderItem(item, index, index === selectedIndex, index === highlightedIndex)
                                      : defaultRenderItem(item, index, index === selectedIndex, index === highlightedIndex)}
                              </div>
                          ))}
                </div>
            )}
        </div>,
        document.body,
    );
};
