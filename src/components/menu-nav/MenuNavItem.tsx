import cn from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
import type { MenuNavIconPosition, MenuNavItem as MenuNavItemType, MenuNavSelectionStyle, MenuNavSize } from './menu-nav-types';

interface MenuNavItemComponentProps {
    item: MenuNavItemType;
    depth: number;
    maxDepth: number;
    selectedId: string;
    size: MenuNavSize;
    orientation: 'vertical' | 'horizontal';
    selectionStyle: MenuNavSelectionStyle;
    iconPosition: MenuNavIconPosition;
    collapsed: boolean;
    onSelect: (id: string, item: MenuNavItemType) => void;
    onMobileSubmenu?: (items: MenuNavItemType[], title: string) => void;
    isMobile: boolean;
}

const chevronDown = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eui-menu-nav-chevron">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const chevronRight = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eui-menu-nav-chevron">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const MenuNavItemComponent: React.FC<MenuNavItemComponentProps> = ({
    item,
    depth,
    maxDepth,
    selectedId,
    size,
    orientation,
    selectionStyle,
    iconPosition: globalIconPos,
    collapsed,
    onSelect,
    onMobileSubmenu,
    isMobile,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [hoverOpen, setHoverOpen] = useState(false);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const itemRef = useRef<HTMLLIElement>(null);

    const hasChildren = item.children && item.children.length > 0 && depth < maxDepth;
    const isSelected = selectedId === item.id;
    const iconPos = item.iconPosition || globalIconPos;
    const isVertical = orientation === 'vertical';

    const handleClick = useCallback(() => {
        if (item.disabled) return;

        if (hasChildren) {
            if (isMobile && onMobileSubmenu) {
                onMobileSubmenu(item.children!, item.label);
            } else if (isVertical) {
                setExpanded((prev) => !prev);
            }
            return;
        }

        item.onClick?.();
        onSelect(item.id, item);
    }, [item, hasChildren, isMobile, onMobileSubmenu, isVertical, onSelect]);

    const handleMouseEnter = useCallback(() => {
        if (isMobile || isVertical || !hasChildren) return;
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setHoverOpen(true);
    }, [isMobile, isVertical, hasChildren]);

    const handleMouseLeave = useCallback(() => {
        if (isMobile || isVertical || !hasChildren) return;
        hoverTimerRef.current = setTimeout(() => setHoverOpen(false), 150);
    }, [isMobile, isVertical, hasChildren]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
            }
            if (hasChildren && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) {
                e.preventDefault();
                setExpanded(true);
                setHoverOpen(true);
            }
            if (hasChildren && (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'Escape')) {
                e.preventDefault();
                setExpanded(false);
                setHoverOpen(false);
            }
        },
        [handleClick, hasChildren],
    );

    if (item.separator) {
        return <li className="eui-menu-nav-separator" role="separator" aria-hidden="true" />;
    }

    const showSubmenu = isVertical ? expanded : hoverOpen;
    const isChildSelected = hasChildren && isDescendantSelected(item.children!, selectedId);

    const iconElement = item.icon ? <span className="eui-menu-nav-item-icon">{item.icon}</span> : null;

    const content = (
        <>
            {iconPos === 'left' && iconElement}
            {!collapsed && <span className="eui-menu-nav-item-label">{item.label}</span>}
            {!collapsed && item.badge && <span className="eui-menu-nav-item-badge">{item.badge}</span>}
            {iconPos === 'right' && iconElement}
            {!collapsed && hasChildren && (
                <span className="eui-menu-nav-item-expand">
                    {isVertical ? (expanded ? chevronDown : chevronRight) : chevronDown}
                </span>
            )}
        </>
    );

    const Tag = item.href ? 'a' : 'div';
    const tagProps = item.href ? { href: item.href } : {};

    return (
        <li
            ref={itemRef}
            className={cn('eui-menu-nav-item-wrapper', {
                'eui-menu-nav-item-has-children': hasChildren,
                'eui-menu-nav-item-expanded': showSubmenu,
            })}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Tag
                {...tagProps}
                className={cn(
                    'eui-menu-nav-item',
                    `eui-menu-nav-item-depth-${depth}`,
                    `eui-menu-nav-select-${selectionStyle}`,
                    item.className,
                    {
                        'eui-menu-nav-item-selected': isSelected,
                        'eui-menu-nav-item-child-selected': isChildSelected && !isSelected,
                        'eui-menu-nav-item-disabled': item.disabled,
                        'eui-menu-nav-item-collapsed': collapsed,
                    },
                )}
                tabIndex={item.disabled ? -1 : 0}
                aria-current={isSelected ? 'page' : undefined}
                aria-disabled={item.disabled || undefined}
                aria-expanded={hasChildren ? showSubmenu : undefined}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
            >
                {content}
            </Tag>

            {hasChildren && showSubmenu && !isMobile && (
                <ul className={cn('eui-menu-nav-submenu', `eui-menu-nav-submenu-depth-${depth}`)}>
                    {item.children!.map((child) => (
                        <MenuNavItemComponent
                            key={child.id}
                            item={child}
                            depth={depth + 1}
                            maxDepth={maxDepth}
                            selectedId={selectedId}
                            size={size}
                            orientation={orientation}
                            selectionStyle={selectionStyle}
                            iconPosition={globalIconPos}
                            collapsed={false}
                            onSelect={onSelect}
                            isMobile={isMobile}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

function isDescendantSelected(items: MenuNavItemType[], selectedId: string): boolean {
    for (const item of items) {
        if (item.id === selectedId) return true;
        if (item.children && isDescendantSelected(item.children, selectedId)) return true;
    }
    return false;
}

export default MenuNavItemComponent;
