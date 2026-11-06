import React from 'react';
import type { AnchoredPlacement } from '../../hooks/useAnchoredPosition';

export type ConfirmPopoverPlacement = AnchoredPlacement;

export interface ConfirmPopoverAction {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
    layout?: 'default' | 'outlined' | 'plain';
    defaultAction?: boolean;
}

export interface ConfirmPopoverOptions {
    target: HTMLElement;
    title?: string;
    message: string | React.ReactNode;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | React.ReactElement;
    placement?: ConfirmPopoverPlacement;
    actions: ConfirmPopoverAction[];
    onClose?: () => void;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    defaultActionIndex?: number;
}

export interface ConfirmPopoverData extends ConfirmPopoverOptions {
    id: number;
}
