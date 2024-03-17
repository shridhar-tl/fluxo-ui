import { PlacementCorners } from '../../types';

export interface MenuItemBase {
    id?: any;
    label?: string;
    icon?: React.ReactNode;
    command?: (id?: any) => void;
    seperator?: boolean;
    disabled?: boolean;
}

export interface MenuItem extends MenuItemBase {
    items?: MenuItemBase[];
}

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
