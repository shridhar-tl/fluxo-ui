import type React from 'react';

import { contrastRatio, parseColor, relativeLuminance } from '../pdf/core/color';

export type ToneColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export const toneColors: readonly ToneColor[] = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'];

export const isToneColor = (value: string | undefined): value is ToneColor =>
    value !== undefined && (toneColors as readonly string[]).includes(value);

const toRgb = (color: string) => {
    const parsed = parseColor(color);
    return parsed && parsed.a > 0 ? parsed : null;
};

export const getRelativeLuminance = (color: string): number | null => {
    const rgb = toRgb(color);
    return rgb ? relativeLuminance(rgb) : null;
};

export const getReadableTextColor = (color: string, dark = '#111827', light = '#ffffff'): string => {
    const background = toRgb(color);
    const darkRgb = toRgb(dark);
    const lightRgb = toRgb(light);
    if (!background || !darkRgb || !lightRgb) return light;
    return contrastRatio(darkRgb, background) > contrastRatio(lightRgb, background) ? dark : light;
};

export type ToneStyle = React.CSSProperties & Record<`--${string}`, string>;

export const getCustomToneStyle = (color?: string, textColor?: string): ToneStyle | undefined => {
    if (!color || isToneColor(color)) {
        return textColor ? { '--eui-tone-on': textColor } : undefined;
    }
    const luminance = getRelativeLuminance(color);
    const style: ToneStyle = {
        '--eui-tone-base': color,
        '--eui-tone-on': textColor ?? getReadableTextColor(color),
    };
    const softMix = luminance === null ? null : luminance > 0.45 ? 32 : luminance > 0.2 ? 48 : luminance < 0.06 ? 52 : null;
    if (softMix !== null) style['--eui-tone-soft-fg'] = `color-mix(in srgb, ${color} ${softMix}%, var(--eui-text))`;
    return style;
};

export const resolveToneClass = (prefix: string, color?: string): string =>
    `${prefix}-tone-${isToneColor(color) ? color : color ? 'custom' : 'default'}`;
