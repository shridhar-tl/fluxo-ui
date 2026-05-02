import cn from 'classnames';
import React, { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './SignaturePad.scss';

type SigBorder = 'solid' | 'dashed' | 'none';
type SigBackground = 'white' | 'transparent' | 'grid' | 'dotted';
type SigSize = 'sm' | 'md' | 'lg' | 'full';
type SigThickness = 'thin' | 'regular' | 'bold' | number;
type SigInputMode = 'draw' | 'type';

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
    penColor?: string;
    thickness?: SigThickness;
    showToolbar?: boolean;
    showSwatches?: boolean;
    swatches?: string[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
    allowTypeMode?: boolean;
    typeFontFamily?: string;
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
const DEFAULT_TYPE_FONT = '"Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive';

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

const drawTypedSignature = (
    ctx: CanvasRenderingContext2D,
    text: string,
    color: string,
    fontFamily: string,
    cssWidth: number,
    cssHeight: number,
) => {
    if (!text) return;
    ctx.save();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontSize = Math.floor(cssHeight * 0.55);
    const minFont = 18;
    const maxWidthPx = cssWidth * 0.92;
    while (fontSize > minFont) {
        ctx.font = `italic ${fontSize}px ${fontFamily}`;
        if (ctx.measureText(text).width <= maxWidthPx) break;
        fontSize -= 2;
    }
    ctx.fillText(text, cssWidth / 2, cssHeight / 2, maxWidthPx);
    ctx.restore();
};

const useToolbarKeyboardNav = () => {
    return useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'BUTTON' && target.getAttribute('role') !== 'radio') return;
        const toolbar = e.currentTarget;
        const focusable = Array.from(
            toolbar.querySelectorAll<HTMLElement>('button:not([disabled]), [role="radio"]:not([aria-disabled="true"])'),
        );
        const idx = focusable.indexOf(target);
        if (idx < 0) return;
        let next = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            next = (idx + 1) % focusable.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            next = (idx - 1 + focusable.length) % focusable.length;
        } else if (e.key === 'Home') {
            next = 0;
        } else if (e.key === 'End') {
            next = focusable.length - 1;
        } else {
            return;
        }
        e.preventDefault();
        focusable[next]?.focus();
    }, []);
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
        allowTypeMode = true,
        typeFontFamily = DEFAULT_TYPE_FONT,
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
    const [mode, setMode] = useState<SigInputMode>('draw');
    const [typedText, setTypedText] = useState<string>('');
    const reactId = useId();
    const describedById = `eui-sig-desc-${reactId}`;
    const labelId = `eui-sig-label-${reactId}`;

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
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        if (mode === 'type') {
            const rect = wrap.getBoundingClientRect();
            drawTypedSignature(ctx, typedText, currentColor, typeFontFamily, rect.width, rect.height);
            return;
        }

        for (const stroke of strokesRef.current) {
            drawStroke(ctx, stroke);
        }
        if (currentRef.current) drawStroke(ctx, currentRef.current);
    }, [mode, typedText, currentColor, typeFontFamily]);

    useEffect(() => {
        redrawRef.current = redraw;
        redraw();
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
        if (disabled || mode !== 'draw') return;
        e.preventDefault();
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        const pt = getLocalPoint(e);
        currentRef.current = { color: currentColor, width: widthPx, points: [pt] };
        onBegin?.();
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!currentRef.current || mode !== 'draw') return;
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

    const clearAll = useCallback(() => {
        strokesRef.current = [];
        currentRef.current = null;
        setTypedText('');
        setIsEmpty(true);
        onChange?.(true);
        redraw();
    }, [onChange, redraw]);

    useImperativeHandle(
        ref,
        (): SignaturePadHandle => ({
            clear: clearAll,
            undo: () => {
                if (mode === 'type') {
                    setTypedText((prev) => prev.slice(0, -1));
                    return;
                }
                strokesRef.current.pop();
                const empty = strokesRef.current.length === 0;
                setIsEmpty(empty);
                onChange?.(empty);
                redraw();
            },
            isEmpty: () => (mode === 'type' ? typedText.trim().length === 0 : strokesRef.current.length === 0),
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
        [redraw, onChange, mode, typedText, clearAll],
    );

    const handleClear = clearAll;

    const handleUndo = () => {
        if (mode === 'type') {
            setTypedText((prev) => {
                const next = prev.slice(0, -1);
                if (next.length === 0) {
                    setIsEmpty(true);
                    onChange?.(true);
                }
                return next;
            });
            return;
        }
        strokesRef.current.pop();
        const empty = strokesRef.current.length === 0;
        setIsEmpty(empty);
        onChange?.(empty);
        redraw();
    };

    const handleTypedTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTypedText(value);
        const empty = value.trim().length === 0;
        if (empty !== isEmpty) {
            setIsEmpty(empty);
            onChange?.(empty);
        }
    };

    const handleModeChange = (next: SigInputMode) => {
        if (mode === next) return;
        setMode(next);
        strokesRef.current = [];
        currentRef.current = null;
        setTypedText('');
        setIsEmpty(true);
        onChange?.(true);
    };

    const dynamicAriaLabel = `${ariaLabel} (${isEmpty ? 'empty' : mode === 'type' ? 'has typed signature' : 'has signature'})`;

    const handleToolbarKey = useToolbarKeyboardNav();

    return (
        <div className={cn('eui-sig', `eui-sig-size-${size}`, className)}>
            {allowTypeMode && (
                <div
                    className="eui-sig-mode-tabs"
                    role="tablist"
                    aria-label="Signature input mode"
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            e.preventDefault();
                            handleModeChange(mode === 'draw' ? 'type' : 'draw');
                        }
                    }}
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === 'draw'}
                        tabIndex={mode === 'draw' ? 0 : -1}
                        className={cn('eui-sig-mode-tab', { 'eui-sig-mode-tab-active': mode === 'draw' })}
                        onClick={() => handleModeChange('draw')}
                        disabled={disabled}
                    >
                        Draw
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === 'type'}
                        tabIndex={mode === 'type' ? 0 : -1}
                        className={cn('eui-sig-mode-tab', { 'eui-sig-mode-tab-active': mode === 'type' })}
                        onClick={() => handleModeChange('type')}
                        disabled={disabled}
                    >
                        Type
                    </button>
                </div>
            )}

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
                    className={cn('eui-sig-canvas', { 'eui-sig-canvas-readonly': mode === 'type' })}
                    role="img"
                    aria-label={dynamicAriaLabel}
                    aria-describedby={describedById}
                    aria-labelledby={labelId}
                    tabIndex={0}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                />
                {isEmpty && placeholder && mode === 'draw' && <div className="eui-sig-placeholder">{placeholder}</div>}
                <span id={labelId} className="eui-sig-sr-only">{dynamicAriaLabel}</span>
                <span id={describedById} className="eui-sig-sr-only">
                    {mode === 'draw'
                        ? 'Draw your signature using mouse, touch, or stylus. Switch to Type mode if you cannot draw.'
                        : 'Type your name in the field below to render it as a signature.'}
                </span>
            </div>

            {mode === 'type' && (
                <div className="eui-sig-type-row">
                    <label htmlFor={`${reactId}-type-input`} className="eui-sig-type-label">
                        Type your name
                    </label>
                    <input
                        id={`${reactId}-type-input`}
                        type="text"
                        className="eui-sig-type-input"
                        value={typedText}
                        onChange={handleTypedTextChange}
                        disabled={disabled}
                        autoComplete="name"
                        spellCheck={false}
                        placeholder="e.g. Jane Doe"
                    />
                </div>
            )}

            {showToolbar && (
                <div
                    className="eui-sig-toolbar"
                    role="toolbar"
                    aria-label="Signature pad actions"
                    onKeyDown={handleToolbarKey}
                >
                    {showSwatches && mode === 'draw' && (
                        <div className="eui-sig-swatches" role="radiogroup" aria-label="Pen color">
                            {swatches.map((c, i) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={cn('eui-sig-swatch', { 'eui-sig-swatch-active': c === currentColor })}
                                    style={{ background: c }}
                                    aria-label={`Pen color ${c}`}
                                    role="radio"
                                    aria-checked={c === currentColor}
                                    tabIndex={c === currentColor || (i === 0 && currentColor !== c) ? 0 : -1}
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
