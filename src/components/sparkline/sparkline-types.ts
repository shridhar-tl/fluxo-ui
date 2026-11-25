import type React from 'react';

import type { ToneColor } from '../../utils/color-tone';

export type SparklineType = 'line' | 'area' | 'bar' | 'winloss' | 'discrete' | 'bullet' | 'pie';
export type SparklineCurve = 'linear' | 'smooth' | 'step';
export type SparklineDots = 'none' | 'all' | 'last' | 'first-last' | 'min-max' | 'extremes';
export type SparklineFill = 'gradient' | 'solid' | 'none';
export type SparklineColor = ToneColor | (string & {});
export type SparklineReference = 'mean' | 'median' | 'zero' | 'min' | 'max' | number;

export interface SparklineDatum {
    value: number | null;
    label?: string;
    color?: string;
}

export type SparklineInput = number | null | SparklineDatum;

export interface SparklineReferenceLine {
    value: SparklineReference;
    label?: string;
    color?: string;
    dashed?: boolean;
}

export interface SparklineBand {
    from: number;
    to: number;
    color?: string;
}

export interface SparklineTrendColors {
    up?: SparklineColor;
    down?: SparklineColor;
    flat?: SparklineColor;
}

export interface SparklinePointInfo {
    index: number;
    value: number | null;
    label?: string;
}

export interface SparklineProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color' | 'children'> {
    data?: SparklineInput[];
    type?: SparklineType;
    width?: number | string;
    height?: number;
    color?: SparklineColor;
    negativeColor?: string;
    trendColors?: boolean | SparklineTrendColors;
    strokeWidth?: number;
    curve?: SparklineCurve;
    fill?: SparklineFill;
    fillOpacity?: number;
    dots?: SparklineDots;
    dotRadius?: number;
    minColor?: string;
    maxColor?: string;
    referenceLine?: SparklineReference | SparklineReferenceLine;
    band?: SparklineBand;
    min?: number;
    max?: number;
    threshold?: number;
    barGap?: number;
    barRadius?: number;
    connectNulls?: boolean;
    target?: number;
    ranges?: number[];
    colors?: string[];
    innerRadius?: number;
    animate?: boolean;
    animationDuration?: number;
    interactive?: boolean;
    showCursor?: boolean;
    formatValue?: (value: number, index: number) => string;
    renderTooltip?: (point: SparklinePointInfo) => React.ReactNode;
    onPointHover?: (point: SparklinePointInfo | null) => void;
    onPointClick?: (point: SparklinePointInfo) => void;
    ariaLabel?: string;
    valueLabel?: string;
}
