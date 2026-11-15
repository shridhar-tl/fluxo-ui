import classNames from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon, TimesIcon } from '../../assets/icons';
import '../eui-base.scss';
import { OverlayPanel } from '../overlay-panel/OverlayPanel';
import './tab-overflow-menu.scss';
import type { TabViewVariant } from './TabView';
import { isTabDisabled, renderIcon } from './tabview-utils';

export interface TabOverflowItem {
    index: number;
    tab: React.ReactElement;
}

interface TabOverflowMenuProps {
    items: TabOverflowItem[];
    activeIndex: number;
    position: 'top' | 'bottom' | 'left' | 'right';
    variant: TabViewVariant;
    onSelect: (index: number, tab: React.ReactElement) => void;
    onClose?: (index: number, tab: React.ReactElement) => void;
    triggerRef?: (el: HTMLButtonElement | null) => void;
    onTriggerKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

interface TabProps {
    header?: React.ReactNode;
    leftIcon?: string | React.ComponentType<Record<string, unknown>> | React.ReactElement;
    closable?: boolean;
}

const getTabProps = (tab: React.ReactElement): TabProps => tab.props as TabProps;

const getPlainLabel = (header: React.ReactNode): string => {
    if (typeof header === 'string') return header;
    if (typeof header === 'number') return String(header);
    return 'Tab';
};

export const TabOverflowMenu: React.FC<TabOverflowMenuProps> = ({ items, activeIndex, position, variant, onSelect, onClose, triggerRef, onTriggerKeyDown }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [target, setTarget] = useState<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const isVertical = position === 'left' || position === 'right';

    const activeItem = items.find((item) => item.index === activeIndex);
    const activeProps = activeItem ? getTabProps(activeItem.tab) : null;
    const countLabel = `${items.length} more ${items.length === 1 ? 'tab' : 'tabs'}`;
    const triggerLabel = activeProps ? `${getPlainLabel(activeProps.header)} selected. ${countLabel}` : countLabel;

    const setTriggerNode = useCallback(
        (el: HTMLButtonElement | null) => {
            setTarget(el);
            triggerRef?.(el);
        },
        [triggerRef],
    );

    const closeMenu = useCallback(() => setIsOpen(false), []);

    const handleSelect = (item: TabOverflowItem) => {
        if (isTabDisabled(item.tab)) return;
        onSelect(item.index, item.tab);
        setIsOpen(false);
    };

    const handleListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
        if (!listRef.current) return;
        const buttons = Array.from(listRef.current.querySelectorAll<HTMLButtonElement>('button.eui-tab-overflow-item-main:not(:disabled)'));
        if (buttons.length === 0) return;
        const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
        let nextIndex = -1;
        if (e.key === 'ArrowDown') nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length;
        else if (e.key === 'ArrowUp') nextIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
        else if (e.key === 'Home') nextIndex = 0;
        else if (e.key === 'End') nextIndex = buttons.length - 1;
        if (nextIndex >= 0) {
            e.preventDefault();
            buttons[nextIndex].focus();
        }
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        onTriggerKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
        }
    };

    const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowDown' && e.target === e.currentTarget) {
            e.preventDefault();
            listRef.current?.querySelector<HTMLButtonElement>('button.eui-tab-overflow-item-main:not(:disabled)')?.focus();
        }
    };

    return (
        <>
            <button
                ref={setTriggerNode}
                type="button"
                className={classNames('eui-tab-overflow-trigger', `eui-tab-overflow-trigger-${position}`, variant !== 'default' && `eui-tab-overflow-trigger-${variant}`, {
                    'eui-tab-overflow-trigger-active': !!activeItem,
                    'eui-tab-overflow-trigger-open': isOpen,
                    'eui-tab-overflow-trigger-vertical': isVertical,
                })}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={triggerLabel}
                onClick={() => setIsOpen((open) => !open)}
                onKeyDown={handleTriggerKeyDown}
            >
                {activeProps && (
                    <>
                        {renderIcon(activeProps.leftIcon, 'eui-tab-header-icon')}
                        <span className="eui-tab-overflow-label">{activeProps.header}</span>
                    </>
                )}
                <span className="eui-tab-overflow-count" aria-hidden="true">
                    {activeProps ? items.length : `+${items.length}`}
                </span>
                <ChevronDownIcon className="eui-tab-overflow-chevron" aria-hidden="true" />
            </button>

            <OverlayPanel
                isOpen={isOpen}
                target={target}
                onClose={closeMenu}
                title="More tabs"
                width="16rem"
                maxHeight="20rem"
                placement={isVertical ? 'auto' : position === 'bottom' ? 'topRight' : 'bottomRight'}
                className="eui-tab-overflow-panel"
                onKeyDown={handlePanelKeyDown}
            >
                <ul ref={listRef} className="eui-tab-overflow-list" onKeyDown={handleListKeyDown}>
                    {items.map((item) => {
                        const props = getTabProps(item.tab);
                        const disabled = isTabDisabled(item.tab);
                        const isActive = item.index === activeIndex;
                        return (
                            <li key={item.index} className="eui-tab-overflow-row">
                                <button
                                    type="button"
                                    className={classNames('eui-tab-overflow-item-main', { 'eui-tab-overflow-item-active': isActive })}
                                    disabled={disabled}
                                    aria-current={isActive ? 'true' : undefined}
                                    onClick={() => handleSelect(item)}
                                >
                                    {renderIcon(props.leftIcon, 'eui-tab-header-icon')}
                                    <span className="eui-tab-overflow-item-label">{props.header}</span>
                                    {isActive && <CheckIcon className="eui-tab-overflow-item-check" aria-hidden="true" />}
                                </button>
                                {props.closable && !disabled && onClose && (
                                    <button
                                        type="button"
                                        className="eui-tab-overflow-item-close"
                                        aria-label={`Close ${getPlainLabel(props.header)}`}
                                        onClick={() => onClose(item.index, item.tab)}
                                    >
                                        <TimesIcon aria-hidden="true" />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </OverlayPanel>
        </>
    );
};
