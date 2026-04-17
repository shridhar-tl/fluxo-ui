import type React from 'react';
import type { SVGIcon } from '../../assets/icons';

export type DockPosition = 'left' | 'right' | 'bottom' | 'float';
export type PinState = 'pinned' | 'auto-hide';
export type TabMode = 'icon' | 'icon-label';

export interface Breakpoint {
    key: string;
    maxWidth: number;
    label: string;
}

export interface FloatPos {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface PanelBreakpointOverride {
    breakpointKey: string;
    position?: DockPosition;
    state?: PinState;
    size?: number;
    visible?: boolean;
}

export interface PanelConfig {
    id: string;
    title: string;
    icon: SVGIcon;
    children?: React.ReactNode;
    defaultSize?: number;
    minSize?: number;
    defaultState?: PinState;
    defaultPosition?: DockPosition;
    defaultVisible?: boolean;
    defaultFloatPos?: FloatPos;
    userCanMove?: boolean;
    userCanResize?: boolean;
    userCanClose?: boolean;
    userCanTogglePin?: boolean;
    breakpoints?: PanelBreakpointOverride[];
}

export interface PanelRuntimeState {
    id: string;
    position: DockPosition;
    pinState: PinState;
    size: number;
    floatPos: FloatPos;
    visible: boolean;
}

export interface DockedLayoutState {
    panels: Record<string, PanelRuntimeState>;
    activeTabs: Record<string, string | null>;
}

export interface DockedLayoutProps {
    panels: PanelConfig[];
    children?: React.ReactNode;
    layoutState?: DockedLayoutState;
    onChange?: (state: DockedLayoutState) => void;
    tabMode?: TabMode;
    breakpoints?: Breakpoint[];
    className?: string;
    style?: React.CSSProperties;
}

export const defaultActivityBarWidth = 48;
export const defaultBottomBarHeight = 36;
export const defaultPanelSize = 260;
export const defaultFloatWidth = 320;
export const defaultFloatHeight = 400;
