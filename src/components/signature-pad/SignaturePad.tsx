import cn from 'classnames';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './SignaturePad.scss';

type SigBorder = 'solid' | 'dashed' | 'none';
type SigBackground = 'white' | 'transparent' | 'grid' | 'dotted';
type SigSize = 'sm' | 'md' | 'lg' | 'full';
type SigThickness = 'thin' | 'regular' | 'bold' | number;

interface SignaturePadHandle {
    clear: () => void;
    undo: () => void;
    isEmpty: () => boolean;
    toDataURL: (type?: string, quality?: number) => string;
    toBlob: (type?: string, quality?: number) => Promise<Blob | null>;
}

interface SignaturePadProps {
    size?: SigSize;
    border?: SigBorder;
    background?: SigBackground;
    /**
     * Pen color. When omitted, adapts to the current theme text color via --eui-text.
     */
    penColor?: string;
    thickness?: SigThickness;
    showToolbar?: boolean;
    showSwatches?: boolean;
    swatches?: string[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
    onBegin?: () => void;
    onEnd?: () => void;
    onChange?: (isEmpty: boolean) => void;
}

interface Point {
    x: number;
    y: number;
    t: number;
}

type Stroke = {
    color: string;
    width: number;
    points: Point[];
};

const DEFAULT_SWATCHES = ['#111827', '#f3f4f6', '#2563eb', '#dc2626', '#16a34a'];

const readThemeInk = (el: HTMLElement | null): string => {
    if (!el || typeof window === 'undefined') return '#111827';
    const v = getComputedStyle(el).getPropertyValue('--eui-text').trim();
    return v || '#111827';
};

const thicknessToPx = (t: SigThickness): number => {
    if (typeof t === 'number') return t;
    if (t === 'thin') return 1.5;
    if (t === 'bold') return 4;
    return 2.5;
};

const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    const pts = stroke.points;
    if (pts.length === 0) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pts.length < 3) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
        if (pts.length === 2) {
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            ctx.lineTo(pts[1].x, pts[1].y);
            ctx.stroke();
        }
        return;
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
};

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>((props, ref) => {
    const {
        size = 'md',
        border = 'solid',
        background = 'white',
        penColor,
        thickness = 'regular',
        showToolbar = true,
        showSwatches = false,
        swatches = DEFAULT_SWATCHES,
        placeholder = 'Sign here',
        disabled = false,
        className,
        ariaLabel = 'Signature pad',
        onBegin,
        onEnd,
        onChange,
    } = props;

    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokesRef = useRef<Stroke[]>([]);
    const currentRef = useRef<Stroke | null>(null);
    const dprRef = useRef<number>(1);
    const [currentColor, setCurrentColor] = useState<string>(penColor ?? '#111827');
    const currentColorRef = useRef<string>(currentColor);
    useEffect(() => {
        currentColorRef.current = currentColor;
    }, [currentColor]);
    const redrawRef = useRef<(() => void) | null>(null);
    const [isEmpty, setIsEmpty] = useState<boolean>(true);

    useEffect(() => {
        if (penColor) {
            setCurrentColor(penColor);
            return;
        }
        const update = () => {
            const prev = currentColorRef.current;
            const next = readThemeInk(wrapRef.current);
            if (prev !== next) {
                for (const s of strokesRef.current) {
                    if (s.color === prev) s.color = next;
                }
                setCurrentColor(next);
                redrawRef.current?.();
            }
        };
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, [penColor]);

    const widthPx = useMemo(() => thicknessToPx(thickness), [thickness]);

    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        for (const stroke of strokesRef.current) {
            drawStroke(ctx, stroke);
        }
        if (currentRef.current) drawStroke(ctx, currentRef.current);
    }, []);

    useEffect(() => {
        redrawRef.current = redraw;
    }, [redraw]);

    const resize = useCallback(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const dpr = window.devicePixelRatio || 1;
        dprRef.current = dpr;
        const rect = wrap.getBoundingClientRect();
        const cssW = Math.max(1, Math.floor(rect.width));
        const cssH = Math.max(1, Math.floor(rect.height));
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        redraw();
    }, [redraw]);

    useLayoutEffect(() => {
        resize();
        const ro = new ResizeObserver(() => resize());
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [resize]);

    const getLocalPoint = (e: PointerEvent | React.PointerEvent): Point => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (disabled) return;
        e.preventDefault();
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        const pt = getLocalPoint(e);
        currentRef.current = { color: currentColor, width: widthPx, points: [pt] };
        onBegin?.();
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!currentRef.current) return;
        const pt = getLocalPoint(e);
        const pts = currentRef.current.points;
        const last = pts[pts.length - 1];
        const dx = pt.x - last.x;
        const dy = pt.y - last.y;
        if (dx * dx + dy * dy < 1) return;
        pts.push(pt);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        if (pts.length >= 3) {
            const p0 = pts[pts.length - 3];
            const p1 = pts[pts.length - 2];
            const p2 = pts[pts.length - 1];
            const midA = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
            const midB = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            ctx.strokeStyle = currentRef.current.color;
            ctx.lineWidth = currentRef.current.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(midA.x, midA.y);
            ctx.quadraticCurveTo(p1.x, p1.y, midB.x, midB.y);
            ctx.stroke();
        } else if (pts.length === 2) {
            ctx.strokeStyle = currentRef.current.color;
            ctx.lineWidth = currentRef.current.width;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            ctx.lineTo(pts[1].x, pts[1].y);
            ctx.stroke();
        }
    };

    const finishStroke = () => {
        if (!currentRef.current) return;
        strokesRef.current.push(currentRef.current);
        currentRef.current = null;
        if (isEmpty) setIsEmpty(false);
        onEnd?.();
        onChange?.(false);
    };

    const handlePointerUp = () => finishStroke();
    const handlePointerCancel = () => finishStroke();

    useImperativeHandle(
        ref,
        (): SignaturePadHandle => ({
            clear: () => {
                strokesRef.current = [];
                currentRef.current = null;
                setIsEmpty(true);
                onChange?.(true);
                redraw();
            },
            undo: () => {
                strokesRef.current.pop();
                const empty = strokesRef.current.length === 0;
                setIsEmpty(empty);
                onChange?.(empty);
                redraw();
            },
            isEmpty: () => strokesRef.current.length === 0,
            toDataURL: (type = 'image/png', quality?: number) => {
                const canvas = canvasRef.current!;
                return canvas.toDataURL(type, quality);
            },
            toBlob: (type = 'image/png', quality?: number) =>
                new Promise((resolve) => {
                    const canvas = canvasRef.current!;
                    canvas.toBlob((b) => resolve(b), type, quality);
                }),
        }),
        [redraw, onChange],
    );

    const handleClear = () => {
        strokesRef.current = [];
        currentRef.current = null;
        setIsEmpty(true);
        onChange?.(true);
        redraw();
    };

    const handleUndo = () => {
        strokesRef.current.pop();
        const empty = strokesRef.current.length === 0;
        setIsEmpty(empty);
        onChange?.(empty);
        redraw();
    };

    const describedById = useMemo(() => `eui-sig-desc-${Math.random().toString(36).slice(2, 8)}`, []);

    return (
        <div className={cn('eui-sig', `eui-sig-size-${size}`, className)}>
            <div
                ref={wrapRef}
                className={cn(
                    'eui-sig-canvas-wrap',
                    `eui-sig-border-${border}`,
                    `eui-sig-bg-${background}`,
                )}
            >
                <canvas
                    ref={canvasRef}
                    className="eui-sig-canvas"
                    role="img"
                    aria-label={ariaLabel}
                    aria-describedby={describedById}
                    tabIndex={0}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                />
                {isEmpty && placeholder && <div className="eui-sig-placeholder">{placeholder}</div>}
                <span id={describedById} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                    Draw your signature using mouse, touch, or stylus.
                </span>
            </div>
            {showToolbar && (
                <div className="eui-sig-toolbar">
                    {showSwatches && (
                        <div className="eui-sig-swatches" role="radiogroup" aria-label="Pen color">
                            {swatches.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={cn('eui-sig-swatch', { 'eui-sig-swatch-active': c === currentColor })}
                                    style={{ background: c }}
                                    aria-label={`Pen color ${c}`}
                                    role="radio"
                                    aria-checked={c === currentColor}
                                    onClick={() => setCurrentColor(c)}
                                />
                            ))}
                        </div>
                    )}
                    <button type="button" className="eui-sig-btn" onClick={handleUndo} disabled={disabled || isEmpty}>
                        Undo
                    </button>
                    <button type="button" className="eui-sig-btn" onClick={handleClear} disabled={disabled || isEmpty}>
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
});

SignaturePad.displayName = 'SignaturePad';

export { SignaturePad };
export type { SignaturePadProps, SignaturePadHandle, SigBorder, SigBackground, SigSize, SigThickness };
