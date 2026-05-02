import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    clamp,
    DEFAULT_SWATCHES,
    HSV,
    hexToHsv,
    hsvToHex,
    hsvToRgb,
    rgbaToString,
    rgbToHex,
    rgbToHsv,
} from './utils';

interface ColorPanelProps {
    value: string;
    alpha: number;
    showAlpha?: boolean;
    showInputs?: boolean;
    showSwatches?: boolean;
    swatches?: string[];
    onChange: (hex: string, alpha: number) => void;
}

const ColorPanel: React.FC<ColorPanelProps> = ({
    value,
    alpha,
    showAlpha = true,
    showInputs = true,
    showSwatches = true,
    swatches = DEFAULT_SWATCHES,
    onChange,
}) => {
    const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value) ?? { h: 0, s: 1, v: 1 });
    const [hexInput, setHexInput] = useState(value);
    const saturationRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);
    const alphaRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef<'sv' | 'hue' | 'alpha' | null>(null);

    useEffect(() => {
        const next = hexToHsv(value);
        if (next) {
            setHsv(next);
            setHexInput(value);
        }
    }, [value]);

    const commit = useCallback(
        (next: HSV, nextAlpha: number) => {
            const hex = hsvToHex(next);
            setHexInput(hex);
            onChange(hex, nextAlpha);
        },
        [onChange],
    );

    const handleSvPointer = useCallback(
        (e: PointerEvent | React.PointerEvent) => {
            const el = saturationRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
            const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
            const next: HSV = { h: hsv.h, s: x, v: 1 - y };
            setHsv(next);
            commit(next, alpha);
        },
        [hsv.h, alpha, commit],
    );

    const handleHuePointer = useCallback(
        (e: PointerEvent | React.PointerEvent) => {
            const el = hueRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
            const next: HSV = { ...hsv, h: x * 360 };
            setHsv(next);
            commit(next, alpha);
        },
        [hsv, alpha, commit],
    );

    const handleAlphaPointer = useCallback(
        (e: PointerEvent | React.PointerEvent) => {
            const el = alphaRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
            commit(hsv, x);
        },
        [hsv, commit],
    );

    useEffect(() => {
        const handleMove = (e: PointerEvent) => {
            if (draggingRef.current === 'sv') handleSvPointer(e);
            else if (draggingRef.current === 'hue') handleHuePointer(e);
            else if (draggingRef.current === 'alpha') handleAlphaPointer(e);
        };
        const handleUp = () => {
            draggingRef.current = null;
        };
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };
    }, [handleSvPointer, handleHuePointer, handleAlphaPointer]);

    const rgb = hsvToRgb(hsv);
    const pureHex = rgbToHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }));

    const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setHexInput(v);
        const next = hexToHsv(v.startsWith('#') ? v : `#${v}`);
        if (next) {
            setHsv(next);
            commit(next, alpha);
        }
    };

    const handleRgbInput = (channel: 'r' | 'g' | 'b', raw: string) => {
        const n = clamp(parseInt(raw || '0', 10) || 0, 0, 255);
        const nextRgb = { ...rgb, [channel]: n };
        const nextHsv = rgbToHsv(nextRgb);
        setHsv(nextHsv);
        commit(nextHsv, alpha);
    };

    return (
        <div className="eui-color-panel" onPointerDown={(e) => e.stopPropagation()}>
            <div
                ref={saturationRef}
                className="eui-color-sv"
                style={{ backgroundColor: pureHex }}
                onPointerDown={(e) => {
                    draggingRef.current = 'sv';
                    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                    handleSvPointer(e);
                }}
            >
                <div className="eui-color-sv-white" />
                <div className="eui-color-sv-black" />
                <div
                    className="eui-color-sv-pointer"
                    style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
                />
            </div>

            <div className="eui-color-sliders">
                <div className="eui-color-preview-wrap">
                    <div className="eui-color-preview-chk" />
                    <div
                        className="eui-color-preview"
                        style={{ backgroundColor: rgbaToString(rgb, alpha) }}
                    />
                </div>
                <div className="eui-color-slider-stack">
                    <div
                        ref={hueRef}
                        className="eui-color-hue"
                        onPointerDown={(e) => {
                            draggingRef.current = 'hue';
                            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                            handleHuePointer(e);
                        }}
                    >
                        <div className="eui-color-hue-pointer" style={{ left: `${(hsv.h / 360) * 100}%` }} />
                    </div>
                    {showAlpha && (
                        <div
                            ref={alphaRef}
                            className="eui-color-alpha"
                            onPointerDown={(e) => {
                                draggingRef.current = 'alpha';
                                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                                handleAlphaPointer(e);
                            }}
                        >
                            <div className="eui-color-alpha-chk" />
                            <div
                                className="eui-color-alpha-track"
                                style={{
                                    background: `linear-gradient(to right, transparent, ${rgbToHex(rgb)})`,
                                }}
                            />
                            <div className="eui-color-alpha-pointer" style={{ left: `${alpha * 100}%` }} />
                        </div>
                    )}
                </div>
            </div>

            {showInputs && (
                <div className="eui-color-inputs">
                    <label className="eui-color-input-group eui-color-input-hex">
                        <span>HEX</span>
                        <input type="text" value={hexInput} onChange={handleHexInput} />
                    </label>
                    <label className="eui-color-input-group">
                        <span>R</span>
                        <input type="number" min={0} max={255} value={rgb.r} onChange={(e) => handleRgbInput('r', e.target.value)} />
                    </label>
                    <label className="eui-color-input-group">
                        <span>G</span>
                        <input type="number" min={0} max={255} value={rgb.g} onChange={(e) => handleRgbInput('g', e.target.value)} />
                    </label>
                    <label className="eui-color-input-group">
                        <span>B</span>
                        <input type="number" min={0} max={255} value={rgb.b} onChange={(e) => handleRgbInput('b', e.target.value)} />
                    </label>
                    {showAlpha && (
                        <label className="eui-color-input-group">
                            <span>A</span>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={Math.round(alpha * 100)}
                                onChange={(e) => commit(hsv, clamp(parseInt(e.target.value, 10) || 0, 0, 100) / 100)}
                            />
                        </label>
                    )}
                </div>
            )}

            {showSwatches && (
                <div className="eui-color-swatches" role="listbox" aria-label="Color swatches">
                    {swatches.map((sw, idx) => (
                        <button
                            key={sw}
                            type="button"
                            role="option"
                            aria-selected={sw.toLowerCase() === value.toLowerCase()}
                            className={cn('eui-color-swatch', { 'eui-color-swatch-active': sw.toLowerCase() === value.toLowerCase() })}
                            style={{ backgroundColor: sw }}
                            aria-label={sw}
                            onClick={() => {
                                const next = hexToHsv(sw);
                                if (next) {
                                    setHsv(next);
                                    commit(next, alpha);
                                }
                            }}
                            onKeyDown={(e) => {
                                const buttons = (e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('.eui-color-swatch')) ?? [];
                                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    buttons[(idx + 1) % buttons.length]?.focus();
                                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
                                } else if (e.key === 'Home') {
                                    e.preventDefault();
                                    buttons[0]?.focus();
                                } else if (e.key === 'End') {
                                    e.preventDefault();
                                    buttons[buttons.length - 1]?.focus();
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ColorPanel;
