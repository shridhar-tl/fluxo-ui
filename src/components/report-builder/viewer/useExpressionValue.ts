import { useEffect, useState } from 'react';
import { evaluateExpression } from '../expression/expression-parser';
import type { ExpressionContext } from '../expression/expression-types';

const SAFE_URL_SCHEMES = /^(https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i;
const SAFE_IMAGE_SCHEMES = /^(https?:|data:image\/|\/|\.\/|\.\.\/)/i;

function isExpression(raw: unknown): raw is string {
    return typeof raw === 'string' && raw.trim().startsWith('=');
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

export function useEvaluatedString(
    raw: unknown,
    ctx: ExpressionContext,
    fallback = '',
): string {
    const initial = isExpression(raw) ? fallback : formatValue(raw ?? fallback);
    const [out, setOut] = useState<string>(initial);

    useEffect(() => {
        let cancelled = false;
        if (!isExpression(raw)) {
            setOut(formatValue(raw ?? fallback));
            return;
        }
        const expr = (raw as string).slice(1);
        evaluateExpression(expr, ctx).then(({ result, error }) => {
            if (cancelled) return;
            if (error) setOut(formatValue(fallback));
            else setOut(formatValue(result));
        });
        return () => { cancelled = true; };
    }, [raw, ctx, fallback]);

    return out;
}

export function useEvaluatedNumber(
    raw: unknown,
    ctx: ExpressionContext,
    fallback: number | undefined = undefined,
): number | undefined {
    const [out, setOut] = useState<number | undefined>(() => {
        if (isExpression(raw)) return fallback;
        const n = Number(raw);
        return Number.isFinite(n) ? n : fallback;
    });

    useEffect(() => {
        let cancelled = false;
        if (!isExpression(raw)) {
            const n = Number(raw);
            setOut(Number.isFinite(n) ? n : fallback);
            return;
        }
        const expr = (raw as string).slice(1);
        evaluateExpression(expr, ctx).then(({ result, error }) => {
            if (cancelled) return;
            if (error) setOut(fallback);
            else {
                const n = Number(result);
                setOut(Number.isFinite(n) ? n : fallback);
            }
        });
        return () => { cancelled = true; };
    }, [raw, ctx, fallback]);

    return out;
}

export function useEvaluatedBoolean(
    raw: unknown,
    ctx: ExpressionContext,
    fallback = false,
): boolean {
    const [out, setOut] = useState<boolean>(() => {
        if (isExpression(raw)) return fallback;
        if (typeof raw === 'boolean') return raw;
        return fallback;
    });

    useEffect(() => {
        let cancelled = false;
        if (!isExpression(raw)) {
            if (typeof raw === 'boolean') setOut(raw);
            else setOut(fallback);
            return;
        }
        const expr = (raw as string).slice(1);
        evaluateExpression(expr, ctx).then(({ result, error }) => {
            if (cancelled) return;
            if (error) setOut(fallback);
            else setOut(Boolean(result));
        });
        return () => { cancelled = true; };
    }, [raw, ctx, fallback]);

    return out;
}

export function sanitizeUrl(url: string | undefined, mode: 'link' | 'image' = 'link'): string | undefined {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    const re = mode === 'image' ? SAFE_IMAGE_SCHEMES : SAFE_URL_SCHEMES;
    return re.test(trimmed) ? trimmed : undefined;
}
