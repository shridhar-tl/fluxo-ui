import React, { useEffect, useState } from 'react';
import { evaluateExpression } from '../expression/expression-parser';
import type { ExpressionContext } from '../expression/expression-types';
import type { ComponentStyleProps, TableCellItem } from '../report-definition-types';
import { useViewerContext } from './ViewerExpressionContext';

type Row = Record<string, unknown>;

const SAFE_URL_SCHEMES = /^(https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i;
const SAFE_IMAGE_SCHEMES = /^(https?:|data:image\/|\/|\.\/|\.\.\/)/i;

function sanitizeUrl(url: string | undefined, isImage: boolean): string | undefined {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    return (isImage ? SAFE_IMAGE_SCHEMES : SAFE_URL_SCHEMES).test(trimmed) ? trimmed : undefined;
}

function styleToCss(style: ComponentStyleProps | undefined): React.CSSProperties {
    if (!style) return {};
    const css: React.CSSProperties = {};
    if (style.textColor) css.color = style.textColor;
    if (style.backgroundColor) css.background = style.backgroundColor;
    if (style.fontSize) css.fontSize = style.fontSize;
    if (style.fontWeight) css.fontWeight = style.fontWeight;
    if (style.fontStyle) css.fontStyle = style.fontStyle;
    if (style.textAlign) css.textAlign = style.textAlign;
    return css;
}

interface Props {
    items: TableCellItem[];
    row: Row;
    exprCtx: ExpressionContext;
}

export const CellItemsRenderer: React.FC<Props> = ({ items, row, exprCtx }) => {
    const viewerCtx = useViewerContext();
    return (
        <div className="eui-rv-cell-items" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            {items.map((item) => (
                <CellItemOne
                    key={item.id}
                    item={item}
                    row={row}
                    exprCtx={exprCtx}
                    onSetVariable={viewerCtx.onSetVariable}
                    onDrillThrough={viewerCtx.onDrillThrough}
                />
            ))}
        </div>
    );
};

const CellItemOne: React.FC<{
    item: TableCellItem;
    row: Row;
    exprCtx: ExpressionContext;
    onSetVariable?: (name: string, value: unknown) => void;
    onDrillThrough?: (variableName: string, value: unknown) => void;
}> = ({ item, row, exprCtx, onSetVariable, onDrillThrough }) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [hrefValue, setHrefValue] = useState<string | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const rowCtx: ExpressionContext = { ...exprCtx, currentRow: row };

            let value = '';
            if (item.type === 'text' || item.type === 'menu' || item.type === 'image') {
                value = item.text ?? '';
            } else if (item.type === 'expression' && item.expression) {
                const { result, error } = await evaluateExpression(item.expression, rowCtx);
                value = error ? `[${error}]` : stringify(result);
            } else if (item.type === 'field' && item.fieldPath) {
                value = stringify(getByPath(row, item.fieldPath));
            } else if (item.type === 'parameter' && item.parameterName) {
                value = stringify(exprCtx.parameters?.[item.parameterName]);
            }

            let href: string | undefined;
            if (item.clickAction === 'link' && item.href) {
                if (item.href.includes('${') || item.href.startsWith('=')) {
                    const hrefExpr = item.href.startsWith('=') ? item.href.slice(1) : item.href;
                    const { result } = await evaluateExpression(hrefExpr, rowCtx);
                    href = stringify(result);
                } else {
                    href = item.href;
                }
            }

            if (!cancelled) {
                setDisplayValue(value);
                setHrefValue(href);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [item, row, exprCtx]);

    const style = styleToCss(item.style);

    const onClick = async () => {
        const rowCtx: ExpressionContext = { ...exprCtx, currentRow: row };
        if (item.clickAction === 'drill' && item.drillVariable) {
            let v: unknown = row;
            if (item.drillValueExpr) {
                const { result } = await evaluateExpression(item.drillValueExpr, rowCtx);
                v = result;
            }
            onDrillThrough?.(item.drillVariable, v);
        } else if (item.clickAction === 'set-variable' && item.setVariableName) {
            let v: unknown = null;
            if (item.setVariableValueExpr) {
                const { result } = await evaluateExpression(item.setVariableValueExpr, rowCtx);
                v = result;
            }
            onSetVariable?.(item.setVariableName, v);
        }
    };

    const clickable = item.clickAction && item.clickAction !== 'none';

    if (item.type === 'image') {
        const src = sanitizeUrl(displayValue || item.src, true);
        const img = src ? (
            <img
                src={src}
                alt={item.alt ?? ''}
                style={{ maxWidth: 32, maxHeight: 32, objectFit: 'contain', ...style }}
            />
        ) : (
            <span style={{ fontSize: 10, color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>[image]</span>
        );
        if (item.clickAction === 'link') {
            const safe = sanitizeUrl(hrefValue, false);
            return safe ? (
                <a href={safe} target="_blank" rel="noopener noreferrer">
                    {img}
                </a>
            ) : (
                img
            );
        }
        return clickable ? (
            <button type="button" onClick={onClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                {img}
            </button>
        ) : (
            img
        );
    }

    if (item.type === 'menu') {
        return (
            <span
                role="button"
                tabIndex={0}
                onClick={clickable ? onClick : undefined}
                style={{ cursor: clickable ? 'pointer' : 'default', fontSize: 14, ...style }}
                aria-label={item.text ?? 'Menu'}
            >
                ⋮
            </span>
        );
    }

    if (item.clickAction === 'link') {
        const safe = sanitizeUrl(hrefValue, false);
        if (safe) {
            return (
                <a href={safe} target="_blank" rel="noopener noreferrer" style={style}>
                    {displayValue}
                </a>
            );
        }
    }

    if (clickable) {
        return (
            <button
                type="button"
                onClick={onClick}
                style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--eui-primary)',
                    textDecoration: 'underline',
                    ...style,
                }}
            >
                {displayValue}
            </button>
        );
    }

    return <span style={style}>{displayValue}</span>;
};

function stringify(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
}

function getByPath(obj: Record<string, unknown>, path: string): unknown {
    if (!path) return obj;
    const parts = path.split('.');
    let cur: unknown = obj;
    for (const p of parts) {
        if (cur === null || cur === undefined) return null;
        if (typeof cur !== 'object') return null;
        if (p === '__proto__' || p === 'constructor' || p === 'prototype') return null;
        if (!Object.prototype.hasOwnProperty.call(cur as object, p)) return null;
        cur = (cur as Record<string, unknown>)[p];
    }
    return cur;
}
