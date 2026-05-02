import { PlacementCorners } from '../../types';

export interface MenuItemBase {
    id?: unknown;
    label?: string;
    icon?: React.ReactNode;
    command?: (id?: unknown) => void;
    /**
     * Renders a divider instead of a clickable item.
     */
    separator?: boolean;
    /**
     * @deprecated Use `separator` instead. Kept for backwards compatibility.
     */
    seperator?: boolean;
    disabled?: boolean;
}

export interface MenuItem extends MenuItemBase {
    items?: MenuItemBase[];
}

export const isSeparator = (m: MenuItemBase): boolean => m.separator === true || m.seperator === true;

export type Handler = ((event: React.MouseEvent, menus: MenuItem[], options?: ContextMenuOptions) => void) | null;

export interface ContextMenuOptions {
    placement?: PlacementCorners;
}

export type ContextMenuState = {
    visible: boolean;
    menus: MenuItem[];
    eventX: number;
    eventY: number;
    placement: PlacementCorners;
    style: {
        left: number;
        top: number;
        opacity: number;
    };
};
