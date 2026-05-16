import type React from 'react';

export type MoveableAxis = 'both' | 'x' | 'y';

export interface MoveablePosition {
    x: number;
    y: number;
}

export type MoveableBounds =
    | 'parent'
    | 'window'
    | 'none'
    | { left: number; top: number; right: number; bottom: number };

export interface MoveableMoveEvent {
    position: MoveablePosition;
    delta: { x: number; y: number };
    pointerType: 'mouse' | 'touch' | 'keyboard';
}

export interface MoveableStartEvent {
    position: MoveablePosition;
    pointerType: 'mouse' | 'touch' | 'keyboard';
}

export interface MoveableEndEvent {
    position: MoveablePosition;
    pointerType: 'mouse' | 'touch' | 'keyboard';
}

export interface MoveableProps {
    children: React.ReactNode;
    defaultPosition?: MoveablePosition;
    position?: MoveablePosition;
    onPositionChange?: (position: MoveablePosition) => void;
    onMoveStart?: (event: MoveableStartEvent) => void;
    onMove?: (event: MoveableMoveEvent) => void;
    onMoveEnd?: (event: MoveableEndEvent) => void;
    axis?: MoveableAxis;
    bounds?: MoveableBounds;
    grid?: [number, number];
    disabled?: boolean;
    handleSelector?: string;
    cancelSelector?: string;
    cursor?: string;
    snapToGrid?: boolean;
    keyboardStep?: number;
    keyboardBigStep?: number;
    elevateOnDrag?: boolean;
    rememberLastPosition?: boolean;
    storageKey?: string;
    className?: string;
    style?: React.CSSProperties;
    ariaLabel?: string;
}
