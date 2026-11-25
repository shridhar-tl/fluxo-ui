import type React from 'react';

import type { ToneColor } from '../../utils/color-tone';
import type { IconProp } from '../../utils/render-icon';

export type TagVariant = 'solid' | 'soft' | 'outline' | 'dashed' | 'dot' | 'gradient' | 'ghost';
export type TagSize = 'xs' | 'sm' | 'md' | 'lg';
export type TagShape = 'rounded' | 'pill' | 'square';
export type TagIconPosition = 'start' | 'end';
export type TagColor = ToneColor | (string & {});
export type TagIcon = IconProp;

export interface TagGradient {
    from: string;
    to: string;
    deg?: number;
}

export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color' | 'children' | 'onClick'> {
    children?: React.ReactNode;
    label?: React.ReactNode;
    color?: TagColor;
    textColor?: string;
    variant?: TagVariant;
    size?: TagSize;
    shape?: TagShape;
    icon?: TagIcon;
    iconPosition?: TagIconPosition;
    avatar?: React.ReactNode;
    count?: React.ReactNode;
    closable?: boolean;
    closeIcon?: React.ReactNode;
    closeLabel?: string;
    onClose?: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLElement>) => void;
    visible?: boolean;
    href?: string;
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
    selected?: boolean;
    uppercase?: boolean;
    bordered?: boolean;
    elevated?: boolean;
    maxWidth?: number | string;
    gradient?: TagGradient;
}

export interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    max?: number;
    expandable?: boolean;
    renderOverflow?: (hiddenCount: number, expanded: boolean) => React.ReactNode;
    collapseLabel?: string;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | number;
    wrap?: boolean;
    size?: TagSize;
    variant?: TagVariant;
    shape?: TagShape;
    color?: TagColor;
    ariaLabel?: string;
}
