import type React from 'react';

export type ResizeHandlePosition = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type ResizeAxis = 'horizontal' | 'vertical' | 'both';

export interface ResizableSize {
    width: number;
    height: number;
}

export interface ResizableConstraints {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
}

export interface ResizeStartEvent {
    handle: ResizeHandlePosition;
    size: ResizableSize;
    pointerType: 'mouse' | 'touch' | 'keyboard';
}

export interface ResizeChangeEvent {
    handle: ResizeHandlePosition;
    size: ResizableSize;
    delta: { width: number; height: number };
    pointerType: 'mouse' | 'touch' | 'keyboard';
}

export interface ResizeEndEvent {
    handle: ResizeHandlePosition;
    size: ResizableSize;
    pointerType: 'mouse' | 'touch' | 'keyboard';
}

export interface ResizableProps extends ResizableConstraints {
    children: React.ReactNode;
    defaultWidth?: number | string;
    defaultHeight?: number | string;
    width?: number;
    height?: number;
    onSizeChange?: (size: ResizableSize) => void;
    onResizeStart?: (event: ResizeStartEvent) => void;
    onResize?: (event: ResizeChangeEvent) => void;
    onResizeEnd?: (event: ResizeEndEvent) => void;
    axis?: ResizeAxis;
    handles?: ResizeHandlePosition[] | 'all' | 'corners' | 'edges';
    grid?: [number, number];
    aspectRatio?: number | boolean;
    lockAspectRatio?: boolean;
    disabled?: boolean;
    handleSize?: number;
    showHandles?: 'always' | 'hover' | 'never';
    keyboardStep?: number;
    keyboardBigStep?: number;
    bounds?: 'parent' | 'window' | { width: number; height: number };
    asChild?: boolean;
    className?: string;
    style?: React.CSSProperties;
    handleClassName?: string;
    ariaLabel?: string;
}
