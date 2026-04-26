import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useViewport } from '../../hooks/useMobile';

export interface TableGridPickerProps {
    open: boolean;
    anchorRef: React.RefObject<HTMLElement | null>;
    onClose: () => void;
    onSelect: (rows: number, cols: number) => void;
    maxRows?: number;
    maxCols?: number;
    defaultRows?: number;
    defaultCols?: number;
}

const TableGridPickerInner: React.FC<TableGridPickerProps> = ({
    open,
    anchorRef,
    onClose,
    onSelect,
    maxRows = 10,
    maxCols = 10,
    defaultRows = 2,
    defaultCols = 3,
}) => {
    const [hover, setHover] = useState<{ r: number; c: number }>({ r: defaultRows, c: defaultCols });
    const [rowsInput, setRowsInput] = useState<number>(defaultRows);
    const [colsInput, setColsInput] = useState<number>(defaultCols);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const panelRef = useRef<HTMLDivElement>(null);
    const { isCompact, isMobile, isTablet } = useViewport();

    const recompute = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
        });
    }, [anchorRef]);

    useLayoutEffect(() => {
        if (!open) return;
        setHover({ r: defaultRows, c: defaultCols });
        setRowsInput(defaultRows);
        setColsInput(defaultCols);
        if (!isCompact) recompute();
    }, [open, defaultRows, defaultCols, recompute, isCompact]);

    useEffect(() => {
        if (!open || isCompact) return;
        const handleScroll = () => recompute();
        const handleResize = () => recompute();
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [open, recompute, isCompact]);

    useEffect(() => {
        if (!open || !isCompact) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open, isCompact]);

    useEffect(() => {
        if (!open) return;
        const handleDocClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (anchorRef.current?.contains(target)) return;
            if (panelRef.current?.contains(target)) return;
            onClose();
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                return;
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                setHover((h) => ({ r: h.r, c: Math.min(maxCols, h.c + 1) }));
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setHover((h) => ({ r: h.r, c: Math.max(1, h.c - 1) }));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHover((h) => ({ r: Math.min(maxRows, h.r + 1), c: h.c }));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHover((h) => ({ r: Math.max(1, h.r - 1), c: h.c }));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onSelect(hover.r, hover.c);
            }
        };
        document.addEventListener('mousedown', handleDocClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleDocClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [anchorRef, hover.c, hover.r, maxCols, maxRows, onClose, onSelect, open]);

    const handleCellEnter = useCallback((r: number, c: number) => {
        setHover({ r, c });
        setRowsInput(r);
        setColsInput(c);
    }, []);

    const handleCellClick = useCallback(
        (r: number, c: number) => {
            onSelect(r, c);
        },
        [onSelect],
    );

    const handleInsertFromInputs = useCallback(() => {
        const r = Math.max(1, Math.min(rowsInput || 1, 100));
        const c = Math.max(1, Math.min(colsInput || 1, 20));
        onSelect(r, c);
    }, [colsInput, onSelect, rowsInput]);

    if (!open) return null;

    if (isCompact) {
        return createPortal(
            <div
                className={
                    'eui-md-table-grid-backdrop' +
                    (isMobile ? ' eui-md-table-grid-backdrop-mobile' : '') +
                    (isTablet ? ' eui-md-table-grid-backdrop-tablet' : '')
                }
                onClick={onClose}
            >
                <div
                    ref={panelRef}
                    className="eui-md-table-grid-panel eui-md-table-grid-panel-mobile"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Insert table"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="eui-md-table-grid-mobile-title">Insert table</div>
                    <div className="eui-md-table-grid-mobile-row">
                        <span className="eui-md-table-grid-mobile-label">Rows</span>
                        <div className="eui-md-table-grid-mobile-stepper">
                            <button
                                type="button"
                                aria-label="Decrease rows"
                                onClick={() => setRowsInput((v) => Math.max(1, v - 1))}
                            >
                                −
                            </button>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={rowsInput}
                                onChange={(e) => setRowsInput(parseInt(e.target.value, 10) || 1)}
                            />
                            <button
                                type="button"
                                aria-label="Increase rows"
                                onClick={() => setRowsInput((v) => Math.min(100, v + 1))}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="eui-md-table-grid-mobile-row">
                        <span className="eui-md-table-grid-mobile-label">Columns</span>
                        <div className="eui-md-table-grid-mobile-stepper">
                            <button
                                type="button"
                                aria-label="Decrease columns"
                                onClick={() => setColsInput((v) => Math.max(1, v - 1))}
                            >
                                −
                            </button>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={colsInput}
                                onChange={(e) => setColsInput(parseInt(e.target.value, 10) || 1)}
                            />
                            <button
                                type="button"
                                aria-label="Increase columns"
                                onClick={() => setColsInput((v) => Math.min(20, v + 1))}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="eui-md-table-grid-mobile-actions">
                        <button type="button" className="eui-md-table-grid-mobile-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" className="eui-md-table-grid-mobile-insert" onClick={handleInsertFromInputs}>
                            Insert {rowsInput} × {colsInput}
                        </button>
                    </div>
                </div>
            </div>,
            document.body,
        );
    }

    const cells: React.ReactNode[] = [];
    for (let r = 1; r <= maxRows; r += 1) {
        for (let c = 1; c <= maxCols; c += 1) {
            const filled = r <= hover.r && c <= hover.c;
            cells.push(
                <button
                    key={r + '-' + c}
                    type="button"
                    className={'eui-md-table-grid-cell' + (filled ? ' is-filled' : '')}
                    onMouseEnter={() => handleCellEnter(r, c)}
                    onFocus={() => handleCellEnter(r, c)}
                    onClick={() => handleCellClick(r, c)}
                    aria-label={r + ' by ' + c + ' table'}
                    tabIndex={-1}
                />,
            );
        }
    }

    return createPortal(
        <div
            ref={panelRef}
            className="eui-md-table-grid-panel"
            role="dialog"
            aria-label="Insert table"
            style={{ top: coords.top, left: coords.left }}
        >
            <div className="eui-md-table-grid-label" aria-live="polite">
                {hover.r} × {hover.c}{' '}
                <span className="eui-md-table-grid-hint">
                    ({hover.r} row{hover.r === 1 ? '' : 's'}, {hover.c} col{hover.c === 1 ? '' : 's'})
                </span>
            </div>
            <div
                className="eui-md-table-grid"
                role="grid"
                aria-rowcount={maxRows}
                aria-colcount={maxCols}
                style={{ gridTemplateColumns: 'repeat(' + maxCols + ', 1fr)' }}
            >
                {cells}
            </div>
            <div className="eui-md-table-grid-inputs">
                <label>
                    <span>Rows</span>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={rowsInput}
                        onChange={(e) => setRowsInput(parseInt(e.target.value, 10) || 1)}
                    />
                </label>
                <label>
                    <span>Cols</span>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={colsInput}
                        onChange={(e) => setColsInput(parseInt(e.target.value, 10) || 1)}
                    />
                </label>
                <button type="button" className="eui-md-table-grid-insert" onClick={handleInsertFromInputs}>
                    Insert
                </button>
            </div>
        </div>,
        document.body,
    );
};

export const TableGridPicker = memo(TableGridPickerInner);
