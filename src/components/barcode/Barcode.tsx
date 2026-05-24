import classNames from 'classnames';
import React, { useId, useMemo } from 'react';
import { BarcodeFormat, encodeBarcode } from './barcode-encoder';
import '../eui-base.scss';
import './Barcode.scss';

export interface BarcodeProps {
    value: string;
    format: BarcodeFormat;
    width?: number;
    height?: number;
    displayValue?: boolean;
    font?: string;
    fontSize?: number;
    textMargin?: number;
    foreground?: string;
    background?: string;
    margin?: number;
    onError?: (err: Error) => void;
    id?: string;
    className?: string;
    alt?: string;
}

const Barcode: React.FC<BarcodeProps> = ({
    value,
    format,
    width = 2,
    height = 80,
    displayValue = true,
    font = 'inherit',
    fontSize = 14,
    textMargin = 6,
    foreground = '#000000',
    background = '#ffffff',
    margin = 10,
    onError,
    id,
    className,
    alt,
}) => {
    const generatedId = useId();
    const barcodeId = id ?? `barcode-${generatedId}`;

    const encoded = useMemo(() => {
        try {
            return { ok: true as const, data: encodeBarcode(value, format) };
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            onError?.(e);
            return { ok: false as const, error: e };
        }
    }, [value, format, onError]);

    if (!encoded.ok) {
        return (
            <div
                id={barcodeId}
                role="img"
                aria-label={`Barcode error: ${encoded.error.message}`}
                className={classNames('eui-barcode eui-barcode-error', className)}
            >
                <span>Invalid {format} value</span>
                <small>{encoded.error.message}</small>
            </div>
        );
    }

    const { bars, text } = encoded.data;
    const totalBars = bars.length;
    const totalWidth = totalBars * width + margin * 2;
    const textHeight = displayValue ? fontSize + textMargin : 0;
    const totalHeight = height + textHeight;

    const barElements: React.ReactNode[] = [];
    let runStart = 0;
    let runValue = bars[0];
    for (let i = 1; i <= bars.length; i += 1) {
        const ch = bars[i];
        if (ch !== runValue) {
            if (runValue === '1') {
                const x = runStart * width + margin;
                const w = (i - runStart) * width;
                barElements.push(<rect key={`b-${runStart}`} x={x} y={0} width={w} height={height} fill={foreground} />);
            }
            runStart = i;
            runValue = ch;
        }
    }

    return (
        <div
            id={barcodeId}
            role="img"
            aria-label={alt ?? `${format}: ${value}`}
            className={classNames('eui-barcode', `eui-barcode-${format.toLowerCase()}`, className)}
        >
            <svg
                width={totalWidth}
                height={totalHeight}
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="crispEdges"
                aria-hidden="true"
            >
                <rect width={totalWidth} height={totalHeight} fill={background === 'transparent' ? 'transparent' : background} />
                {barElements}
                {displayValue && text && (
                    <text
                        x={totalWidth / 2}
                        y={height + textMargin + fontSize * 0.85}
                        fontFamily={font}
                        fontSize={fontSize}
                        textAnchor="middle"
                        fill={foreground}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {text}
                    </text>
                )}
            </svg>
        </div>
    );
};

export { Barcode };
export default Barcode;
