import React, { useRef } from 'react';

interface AppShellResizeHandleProps {
    width: number;
    min: number;
    max: number;
    defaultWidth: number;
    position: 'left' | 'right';
    controls: string;
    onResize: (width: number) => void;
    onResizeStateChange: (resizing: boolean) => void;
}

const keyboardStep = 16;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const AppShellResizeHandle: React.FC<AppShellResizeHandleProps> = ({
    width,
    min,
    max,
    defaultWidth,
    position,
    controls,
    onResize,
    onResizeStateChange,
}) => {
    const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
    const direction = position === 'left' ? 1 : -1;

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = { startX: event.clientX, startWidth: width };
        onResizeStateChange(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag) return;
        onResize(clamp(drag.startWidth + (event.clientX - drag.startX) * direction, min, max));
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        dragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        onResizeStateChange(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        let next: number | null = null;
        if (event.key === 'ArrowRight') next = width + keyboardStep * direction;
        else if (event.key === 'ArrowLeft') next = width - keyboardStep * direction;
        else if (event.key === 'Home') next = min;
        else if (event.key === 'End') next = max;
        else if (event.key === 'Enter') next = defaultWidth;
        if (next === null) return;
        event.preventDefault();
        onResize(clamp(next, min, max));
    };

    return (
        <div
            className="eui-app-shell-resizer"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            aria-controls={controls}
            aria-valuenow={Math.round(width)}
            aria-valuemin={min}
            aria-valuemax={max}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={() => onResize(clamp(defaultWidth, min, max))}
            onKeyDown={handleKeyDown}
        />
    );
};

export { AppShellResizeHandle };
