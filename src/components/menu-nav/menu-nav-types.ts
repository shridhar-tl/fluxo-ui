import type React from 'react';

export type MenuNavOrientation = 'vertical' | 'horizontal';
export type MenuNavSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type MenuNavSelectionStyle = 'border-left' | 'border-bottom' | 'background' | 'arrow' | 'highlight';
export type MenuNavIconPosition = 'left' | 'right';

export interface MenuNavItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    iconPosition?: MenuNavIconPosition;
    disabled?: boolean;
    badge?: React.ReactNode;
    children?: MenuNavItem[];
    group?: string;
    separator?: boolean;
    href?: string;
    onClick?: () => void;
    className?: string;
}

export interface MenuNavGroup {
    id: string;
    label: string;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    items: MenuNavItem[];
}

export interface MenuNavProps {
    items: (MenuNavItem | MenuNavGroup)[];
    orientation?: MenuNavOrientation;
    size?: MenuNavSize;
    selectedId?: string;
    defaultSelectedId?: string;
    onSelect?: (id: string, item: MenuNavItem) => void;
    selectionStyle?: MenuNavSelectionStyle;
    iconPosition?: MenuNavIconPosition;
    collapsed?: boolean;
    collapsible?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    mobileBreakpoint?: number;
    mobileFullScreen?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    searchAriaLabel?: string;
    headerSlot?: React.ReactNode;
    footerSlot?: React.ReactNode;
    maxSubMenuDepth?: number;
    toolbar?: boolean;
    className?: string;
    ariaLabel?: string;
}
