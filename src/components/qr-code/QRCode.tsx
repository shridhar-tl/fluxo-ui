import classNames from 'classnames';
import React, { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { encode, ErrorCorrectionLevel } from './qr-encoder';
import './QRCode.scss';

export type QRCodeShape = 'square' | 'dots' | 'rounded';
export type QRCodeDownloadFormat = 'png' | 'svg' | 'jpeg';

export interface QRCodeLogo {
    src: string;
    size?: number;
    padding?: number;
    rounded?: boolean;
}

export interface QRCodeDownloadOptions {
    format?: QRCodeDownloadFormat;
    fileName?: string;
    scale?: number;
}

export interface QRCodeHandle {
    download: (options?: QRCodeDownloadOptions) => Promise<void>;
    toDataUrl: (options?: QRCodeDownloadOptions) => Promise<string>;
    getSvgString: () => string | null;
}

export interface QRCodeProps {
    value: string;
    size?: number;
    errorCorrection?: ErrorCorrectionLevel;
    margin?: number;
    foreground?: string;
    background?: string;
    moduleShape?: QRCodeShape;
    logo?: QRCodeLogo;
    onError?: (err: Error) => void;
    id?: string;
    className?: string;
    alt?: string;
}

const truncate = (s: string, n = 80) => (s.length > n ? `${s.slice(0, n)}…` : s);

const sanitizeFileName = (name: string) => {
    const cleaned = name.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '');
    return cleaned.length > 0 ? cleaned : 'qr-code';
};

const triggerDownload = (href: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const inlineCssVar = (input: string): string => {
    if (typeof input !== 'string' || !input.startsWith('var(')) return input;
    const match = input.match(/^var\(\s*(--[^,)]+)(?:\s*,\s*([^)]+))?\)\s*$/);
    if (!match) return input;
    const varName = match[1].trim();
    const fallback = match[2]?.trim();
    if (typeof document === 'undefined') return fallback ?? '#000000';
    const value = getComputedStyle(document.body).getPropertyValue(varName).trim();
    return value || fallback || '#000000';
};

const svgToDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const rasterize = (svgString: string, width: number, height: number, format: 'png' | 'jpeg', scale: number): Promise<string> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(width * scale));
            canvas.height = Math.max(1, Math.round(height * scale));
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context unavailable'));
                return;
            }
            if (format === 'jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            try {
                resolve(canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png'));
            } catch (err) {
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        };
        img.onerror = () => reject(new Error('Failed to load QR code image for rasterization'));
        img.src = svgToDataUrl(svgString);
    });

const QRCode = forwardRef<QRCodeHandle, QRCodeProps>(
    (
        {
            value,
            size = 160,
            errorCorrection,
            margin = 4,
            foreground = '#000000',
            background = '#ffffff',
            moduleShape = 'square',
            logo,
            onError,
            id,
            className,
            alt,
        },
        ref,
    ) => {
        const generatedId = useId();
        const codeId = id ?? `qr-${generatedId}`;
        const [matrix, setMatrix] = useState<boolean[][] | null>(null);
        const [error, setError] = useState<Error | null>(null);
        const svgRef = useRef<SVGSVGElement | null>(null);

        const effectiveEC: ErrorCorrectionLevel = errorCorrection ?? (logo ? 'H' : 'M');

        useEffect(() => {
            try {
                const m = encode(value || ' ', effectiveEC);
                setMatrix(m);
                setError(null);
            } catch (err) {
                const errorObj = err instanceof Error ? err : new Error(String(err));
                setError(errorObj);
                setMatrix(null);
                onError?.(errorObj);
            }
        }, [value, effectiveEC, onError]);

        const accessibleName = alt ?? truncate(value);
        const moduleSize = matrix ? size / (matrix.length + margin * 2) : 0;

        const cells = useMemo(() => {
            if (!matrix) return null;
            const out: React.ReactNode[] = [];
            for (let r = 0; r < matrix.length; r += 1) {
                for (let c = 0; c < matrix.length; c += 1) {
                    if (!matrix[r][c]) continue;
                    const x = (c + margin) * moduleSize;
                    const y = (r + margin) * moduleSize;
                    if (moduleShape === 'dots') {
                        out.push(
                            <circle
                                key={`${r}-${c}`}
                                cx={x + moduleSize / 2}
                                cy={y + moduleSize / 2}
                                r={moduleSize / 2.2}
                                fill={foreground}
                            />,
                        );
                    } else if (moduleShape === 'rounded') {
                        out.push(
                            <rect
                                key={`${r}-${c}`}
                                x={x}
                                y={y}
                                width={moduleSize}
                                height={moduleSize}
                                rx={moduleSize / 4}
                                ry={moduleSize / 4}
                                fill={foreground}
                            />,
                        );
                    } else {
                        out.push(
                            <rect
                                key={`${r}-${c}`}
                                x={x}
                                y={y}
                                width={moduleSize + 0.4}
                                height={moduleSize + 0.4}
                                fill={foreground}
                            />,
                        );
                    }
                }
            }
            return out;
        }, [matrix, moduleShape, foreground, moduleSize, margin]);

        const buildExportSvg = useCallback((): string | null => {
            if (!matrix) return null;
            const fg = inlineCssVar(foreground);
            const bgRaw = inlineCssVar(background);
            const bg = background === 'transparent' ? 'transparent' : bgRaw;
            const totalModules = matrix.length + margin * 2;
            const ms = size / totalModules;

            const parts: string[] = [];
            parts.push(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="${moduleShape === 'square' ? 'crispEdges' : 'geometricPrecision'}">`,
            );
            if (bg !== 'transparent') {
                parts.push(`<rect width="${size}" height="${size}" fill="${bg}"/>`);
            }
            for (let r = 0; r < matrix.length; r += 1) {
                for (let c = 0; c < matrix.length; c += 1) {
                    if (!matrix[r][c]) continue;
                    const x = (c + margin) * ms;
                    const y = (r + margin) * ms;
                    if (moduleShape === 'dots') {
                        parts.push(`<circle cx="${x + ms / 2}" cy="${y + ms / 2}" r="${ms / 2.2}" fill="${fg}"/>`);
                    } else if (moduleShape === 'rounded') {
                        parts.push(
                            `<rect x="${x}" y="${y}" width="${ms}" height="${ms}" rx="${ms / 4}" ry="${ms / 4}" fill="${fg}"/>`,
                        );
                    } else {
                        parts.push(`<rect x="${x}" y="${y}" width="${ms + 0.4}" height="${ms + 0.4}" fill="${fg}"/>`);
                    }
                }
            }
            if (logo) {
                const logoSize = logo.size ?? Math.round(size * 0.22);
                const logoPadding = logo.padding ?? 4;
                const logoBoxSize = logoSize + logoPadding * 2;
                const boxFill = bg === 'transparent' ? inlineCssVar('var(--eui-bg)') : bg;
                const rx = logo.rounded ? logoBoxSize / 5 : 0;
                parts.push(
                    `<rect x="${(size - logoBoxSize) / 2}" y="${(size - logoBoxSize) / 2}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${rx}" ry="${rx}" fill="${boxFill}"/>`,
                );
                parts.push(
                    `<image href="${logo.src}" x="${(size - logoSize) / 2}" y="${(size - logoSize) / 2}" width="${logoSize}" height="${logoSize}"/>`,
                );
            }
            parts.push('</svg>');
            return parts.join('');
        }, [matrix, foreground, background, moduleShape, margin, size, logo]);

        useImperativeHandle(
            ref,
            () => ({
                getSvgString: () => buildExportSvg(),
                toDataUrl: async (options) => {
                    const svgString = buildExportSvg();
                    if (!svgString) throw new Error('QR code is not ready');
                    const format = options?.format ?? 'png';
                    if (format === 'svg') return svgToDataUrl(svgString);
                    const scale = options?.scale ?? 2;
                    return rasterize(svgString, size, size, format, scale);
                },
                download: async (options) => {
                    const svgString = buildExportSvg();
                    if (!svgString) throw new Error('QR code is not ready');
                    const format = options?.format ?? 'png';
                    const baseName = sanitizeFileName(options?.fileName ?? alt ?? value ?? 'qr-code');
                    if (format === 'svg') {
                        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        triggerDownload(url, `${baseName}.svg`);
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                        return;
                    }
                    const scale = options?.scale ?? 2;
                    const dataUrl = await rasterize(svgString, size, size, format, scale);
                    const ext = format === 'jpeg' ? 'jpg' : 'png';
                    triggerDownload(dataUrl, `${baseName}.${ext}`);
                },
            }),
            [buildExportSvg, size, value, alt],
        );

        if (error) {
            return (
                <div
                    id={codeId}
                    role="img"
                    aria-label={`QR code error: ${error.message}`}
                    className={classNames('eui-qr-code eui-qr-code-error', className)}
                    style={{ width: size, height: size }}
                >
                    <span>Failed to encode</span>
                    <small>{error.message}</small>
                </div>
            );
        }

        if (!matrix) {
            return (
                <div
                    id={codeId}
                    role="img"
                    aria-label="Generating QR code"
                    className={classNames('eui-qr-code eui-qr-code-loading', className)}
                    style={{ width: size, height: size }}
                />
            );
        }

        const logoSize = logo?.size ?? Math.round(size * 0.22);
        const logoPadding = logo?.padding ?? 4;
        const logoBoxSize = logoSize + logoPadding * 2;

        return (
            <div
                id={codeId}
                role="img"
                aria-label={accessibleName}
                className={classNames('eui-qr-code', `eui-qr-code-${moduleShape}`, className)}
                style={{ width: size, height: size }}
            >
                <svg
                    ref={svgRef}
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    xmlns="http://www.w3.org/2000/svg"
                    shapeRendering={moduleShape === 'square' ? 'crispEdges' : 'geometricPrecision'}
                    aria-hidden="true"
                >
                    {background !== 'transparent' && <rect width={size} height={size} fill={background} />}
                    {cells}
                    {logo && (
                        <>
                            <rect
                                x={(size - logoBoxSize) / 2}
                                y={(size - logoBoxSize) / 2}
                                width={logoBoxSize}
                                height={logoBoxSize}
                                rx={logo.rounded ? logoBoxSize / 5 : 0}
                                ry={logo.rounded ? logoBoxSize / 5 : 0}
                                fill={background === 'transparent' ? 'var(--eui-bg)' : background}
                            />
                            <image
                                href={logo.src}
                                x={(size - logoSize) / 2}
                                y={(size - logoSize) / 2}
                                width={logoSize}
                                height={logoSize}
                                clipPath={logo.rounded ? `inset(0 round ${logoSize / 5}px)` : undefined}
                            />
                        </>
                    )}
                </svg>
            </div>
        );
    },
);

QRCode.displayName = 'QRCode';

export { QRCode };
export default QRCode;
