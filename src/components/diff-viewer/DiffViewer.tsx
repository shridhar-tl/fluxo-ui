import cn from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { diffLines, diffWords, pairReplacements, type LineDiffRow, type WordDiffSeg } from './diff-algo';
import './DiffViewer.scss';

type DiffVariant = 'unified' | 'split' | 'inline' | 'minimal';

interface DiffViewerProps {
    oldValue: string;
    newValue: string;
    oldTitle?: string;
    newTitle?: string;
    variant?: DiffVariant;
    showLineNumbers?: boolean;
    wordDiff?: boolean;
    collapseUnchanged?: boolean | number;
    maxHeight?: number | string;
    ignoreWhitespace?: boolean;
    ignoreCase?: boolean;
    ignoreEmptyLines?: boolean;
    maxLines?: number;
    rowHeight?: number;
    className?: string;
    highlight?: (line: string) => React.ReactNode;
}

interface VirtualItem {
    kind: 'row' | 'skip' | 'replace-del' | 'replace-add';
    row?: LineDiffRow;
    skipCount?: number;
    offset: number;
}

const normalizeForCompare = (s: string, ignoreWhitespace: boolean, ignoreCase: boolean): string => {
    let out = s;
    if (ignoreWhitespace) out = out.replace(/\s+/g, ' ').trim();
    if (ignoreCase) out = out.toLowerCase();
    return out;
};

const clipByLines = (s: string, max: number | undefined): { text: string; truncated: boolean; originalLines: number } => {
    if (!max || max <= 0) return { text: s, truncated: false, originalLines: s.split(/\r\n|\r|\n/).length };
    const lines = s.split(/\r\n|\r|\n/);
    if (lines.length <= max) return { text: s, truncated: false, originalLines: lines.length };
    return { text: lines.slice(0, max).join('\n'), truncated: true, originalLines: lines.length };
};

const DiffViewer: React.FC<DiffViewerProps> = ({
    oldValue,
    newValue,
    oldTitle,
    newTitle,
    variant = 'unified',
    showLineNumbers = true,
    wordDiff = true,
    collapseUnchanged = false,
    maxHeight = 480,
    ignoreWhitespace = false,
    ignoreCase = false,
    ignoreEmptyLines = false,
    maxLines,
    rowHeight = 22,
    className,
    highlight,
}) => {
    const contextLines = typeof collapseUnchanged === 'number' ? collapseUnchanged : 3;
    const collapseEnabled = Boolean(collapseUnchanged);

    const clippedOld = useMemo(() => clipByLines(oldValue, maxLines), [oldValue, maxLines]);
    const clippedNew = useMemo(() => clipByLines(newValue, maxLines), [newValue, maxLines]);

    const rows = useMemo<LineDiffRow[]>(() => {
        const aLines = clippedOld.text.split(/\r\n|\r|\n/);
        const bLines = clippedNew.text.split(/\r\n|\r|\n/);

        if (!ignoreWhitespace && !ignoreCase && !ignoreEmptyLines) {
            return pairReplacements(diffLines(clippedOld.text, clippedNew.text));
        }

        const isEmpty = (l: string) => l.trim() === '';

        if (ignoreEmptyLines) {
            const aNonEmptyIdxMap: number[] = [];
            const bNonEmptyIdxMap: number[] = [];
            const aNonEmpty: string[] = [];
            const bNonEmpty: string[] = [];
            aLines.forEach((l, i) => { if (!isEmpty(l)) { aNonEmptyIdxMap.push(i); aNonEmpty.push(l); } });
            bLines.forEach((l, i) => { if (!isEmpty(l)) { bNonEmptyIdxMap.push(i); bNonEmpty.push(l); } });

            const normA = aNonEmpty.map((l) => normalizeForCompare(l, ignoreWhitespace, ignoreCase));
            const normB = bNonEmpty.map((l) => normalizeForCompare(l, ignoreWhitespace, ignoreCase));
            const normRows = pairReplacements(diffLines(normA.join('\n'), normB.join('\n')));

            const result: LineDiffRow[] = normRows.map((r) => {
                const oldOrigIdx = r.oldIndex !== null ? (aNonEmptyIdxMap[r.oldIndex] ?? null) : null;
                const newOrigIdx = r.newIndex !== null ? (bNonEmptyIdxMap[r.newIndex] ?? null) : null;
                return {
                    ...r,
                    oldIndex: oldOrigIdx,
                    newIndex: newOrigIdx,
                    oldText: oldOrigIdx !== null ? aLines[oldOrigIdx] : '',
                    newText: newOrigIdx !== null ? bLines[newOrigIdx] : '',
                };
            });

            const usedOldIndices = new Set(result.map((r) => r.oldIndex).filter((i): i is number => i !== null));
            const usedNewIndices = new Set(result.map((r) => r.newIndex).filter((i): i is number => i !== null));
            aLines.forEach((l, i) => {
                if (isEmpty(l) && !usedOldIndices.has(i)) {
                    result.push({ type: 'equal', oldIndex: i, newIndex: null, oldText: l, newText: '' });
                }
            });
            bLines.forEach((l, i) => {
                if (isEmpty(l) && !usedNewIndices.has(i)) {
                    result.push({ type: 'equal', oldIndex: null, newIndex: i, oldText: '', newText: l });
                }
            });
            result.sort((a, b) => {
                const ai = a.oldIndex ?? a.newIndex ?? 0;
                const bi = b.oldIndex ?? b.newIndex ?? 0;
                return ai - bi;
            });
            return result;
        }

        const normA = aLines.map((l) => normalizeForCompare(l, ignoreWhitespace, ignoreCase));
        const normB = bLines.map((l) => normalizeForCompare(l, ignoreWhitespace, ignoreCase));
        const normRows = pairReplacements(diffLines(normA.join('\n'), normB.join('\n')));
        return normRows.map((r) => ({
            ...r,
            oldText: r.oldIndex !== null && aLines[r.oldIndex] !== undefined ? aLines[r.oldIndex] : r.oldText,
            newText: r.newIndex !== null && bLines[r.newIndex] !== undefined ? bLines[r.newIndex] : r.newText,
        }));
    }, [clippedOld.text, clippedNew.text, ignoreWhitespace, ignoreCase, ignoreEmptyLines]);

    const virtualItems = useMemo<VirtualItem[]>(() => {
        const pushRow = (items: VirtualItem[], r: LineDiffRow, offset: number): number => {
            if (r.type === 'replace' && variant !== 'split') {
                items.push({ kind: 'replace-del', row: r, offset });
                items.push({ kind: 'replace-add', row: r, offset: offset + rowHeight });
                return offset + rowHeight * 2;
            }
            items.push({ kind: 'row', row: r, offset });
            return offset + rowHeight;
        };

        const items: VirtualItem[] = [];
        let offset = 0;
        if (!collapseEnabled) {
            for (const r of rows) {
                offset = pushRow(items, r, offset);
            }
            return items;
        }
        let i = 0;
        const n = rows.length;
        while (i < n) {
            if (rows[i].type === 'equal') {
                let j = i;
                while (j < n && rows[j].type === 'equal') j++;
                const equalLen = j - i;
                const leadingKeep = i === 0 ? 0 : contextLines;
                const trailingKeep = j === n ? 0 : contextLines;
                if (equalLen <= leadingKeep + trailingKeep + 1) {
                    for (let k = i; k < j; k++) {
                        offset = pushRow(items, rows[k], offset);
                    }
                } else {
                    for (let k = 0; k < leadingKeep; k++) {
                        offset = pushRow(items, rows[i + k], offset);
                    }
                    const hiddenCount = equalLen - leadingKeep - trailingKeep;
                    items.push({ kind: 'skip', skipCount: hiddenCount, offset });
                    offset += rowHeight;
                    for (let k = 0; k < trailingKeep; k++) {
                        offset = pushRow(items, rows[j - trailingKeep + k], offset);
                    }
                }
                i = j;
            } else {
                offset = pushRow(items, rows[i], offset);
                i++;
            }
        }
        return items;
    }, [rows, collapseEnabled, contextLines, rowHeight, variant]);

    const lastItem = virtualItems[virtualItems.length - 1];
    const totalHeight = (lastItem ? lastItem.offset + rowHeight : 0) + (clippedOld.truncated || clippedNew.truncated ? rowHeight * 2 : 0);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [viewportH, setViewportH] = useState(0);

    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        setViewportH(el.clientHeight);
        const ro = new ResizeObserver(() => setViewportH(el.clientHeight));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop((e.target as HTMLDivElement).scrollTop);
    }, []);

    const overscan = 10;
    const startIdx = Math.max(0, (() => {
        let lo = 0, hi = virtualItems.length - 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (virtualItems[mid].offset < scrollTop - overscan * rowHeight) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    })());
    const endIdx = Math.min(virtualItems.length, (() => {
        const bottom = scrollTop + viewportH + overscan * rowHeight;
        let lo = startIdx, hi = virtualItems.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (virtualItems[mid].offset <= bottom) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    })());

    const renderLineContent = (row: LineDiffRow, side: 'old' | 'new') => {
        const text = side === 'old' ? row.oldText : row.newText;
        if (wordDiff && row.type === 'replace') {
            const segs = diffWords(row.oldText, row.newText);
            const list: WordDiffSeg[] = side === 'old' ? segs.oldSegs : segs.newSegs;
            return list.map((seg, idx) => {
                if (seg.type === 'equal') return <span key={idx}>{highlight ? highlight(seg.text) : seg.text}</span>;
                const cls = seg.type === 'insert' ? 'eui-diff-word-add' : 'eui-diff-word-del';
                return <span key={idx} className={cls}>{seg.text}</span>;
            });
        }
        return highlight ? highlight(text) : text;
    };

    const renderUnifiedRow = (item: VirtualItem, key: number) => {
        if (item.kind === 'skip') {
            return (
                <div key={key} className="eui-diff-row" style={{ top: item.offset, height: rowHeight }}>
                    <div className="eui-diff-hunk-skip" style={{ width: '100%' }}>
                        … {item.skipCount} unchanged lines hidden
                    </div>
                </div>
            );
        }
        const row = item.row!;
        if (item.kind === 'replace-del') {
            return (
                <div key={key} className="eui-diff-row eui-diff-row-del" style={{ top: item.offset, height: rowHeight }}>
                    {showLineNumbers && <div className="eui-diff-gutter">{row.oldIndex !== null ? row.oldIndex + 1 : ''}</div>}
                    <div className="eui-diff-sign">−</div>
                    <div className="eui-diff-content">{renderLineContent(row, 'old')}</div>
                </div>
            );
        }
        if (item.kind === 'replace-add') {
            return (
                <div key={key} className="eui-diff-row eui-diff-row-add" style={{ top: item.offset, height: rowHeight }}>
                    {showLineNumbers && <div className="eui-diff-gutter">{row.newIndex !== null ? row.newIndex + 1 : ''}</div>}
                    <div className="eui-diff-sign">+</div>
                    <div className="eui-diff-content">{renderLineContent(row, 'new')}</div>
                </div>
            );
        }
        const isAdd = row.type === 'insert';
        const isDel = row.type === 'delete';
        return (
            <div
                key={key}
                className={cn('eui-diff-row', { 'eui-diff-row-add': isAdd, 'eui-diff-row-del': isDel })}
                style={{ top: item.offset, height: rowHeight }}
            >
                {showLineNumbers && (
                    <div className="eui-diff-gutter">
                        {isAdd ? row.newIndex! + 1 : row.oldIndex !== null ? row.oldIndex + 1 : ''}
                    </div>
                )}
                <div className="eui-diff-sign">{isAdd ? '+' : isDel ? '−' : ' '}</div>
                <div className="eui-diff-content">{renderLineContent(row, isAdd ? 'new' : 'old')}</div>
            </div>
        );
    };

    const renderSplitRow = (item: VirtualItem, key: number) => {
        if (item.kind === 'skip') {
            return (
                <div key={key} className="eui-diff-row" style={{ top: item.offset, height: rowHeight }}>
                    <div className="eui-diff-hunk-skip" style={{ width: '100%' }}>
                        … {item.skipCount} unchanged lines hidden
                    </div>
                </div>
            );
        }
        const row = item.row!;
        const leftType = row.type === 'insert' ? 'equal' : row.type === 'replace' ? 'delete' : row.type;
        const rightType = row.type === 'delete' ? 'equal' : row.type === 'replace' ? 'insert' : row.type;
        const showLeft = row.type !== 'insert';
        const showRight = row.type !== 'delete';
        return (
            <div key={key} className="eui-diff-row" style={{ top: item.offset, height: rowHeight, display: 'flex' }}>
                <div
                    className={cn('eui-diff-split-side', {
                        'eui-diff-row-del': leftType === 'delete' && showLeft,
                    })}
                >
                    {showLineNumbers && <div className="eui-diff-gutter">{row.oldIndex !== null ? row.oldIndex + 1 : ''}</div>}
                    <div className="eui-diff-sign">{leftType === 'delete' && showLeft ? '−' : ' '}</div>
                    <div className="eui-diff-content">{showLeft ? renderLineContent(row, 'old') : ''}</div>
                </div>
                <div
                    className={cn('eui-diff-split-side', {
                        'eui-diff-row-add': rightType === 'insert' && showRight,
                    })}
                >
                    {showLineNumbers && <div className="eui-diff-gutter">{row.newIndex !== null ? row.newIndex + 1 : ''}</div>}
                    <div className="eui-diff-sign">{rightType === 'insert' && showRight ? '+' : ' '}</div>
                    <div className="eui-diff-content">{showRight ? renderLineContent(row, 'new') : ''}</div>
                </div>
            </div>
        );
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const handler = (e: KeyboardEvent) => {
            if (document.activeElement !== el && !el.contains(document.activeElement)) return;
            if (e.key === 'j' || e.key === 'k') {
                const dir = e.key === 'j' ? 1 : -1;
                let curIdx = virtualItems.findIndex((it) => it.offset >= el.scrollTop);
                if (curIdx < 0) curIdx = 0;
                let targetOffset = el.scrollTop;
                for (let i = curIdx + dir; dir > 0 ? i < virtualItems.length : i >= 0; i += dir) {
                    const it = virtualItems[i];
                    if (it && (it.kind === 'row' || it.kind === 'replace-del') && it.row && it.row.type !== 'equal') {
                        targetOffset = it.offset;
                        break;
                    }
                }
                el.scrollTo({ top: targetOffset, behavior: 'smooth' });
            }
        };
        el.addEventListener('keydown', handler);
        return () => el.removeEventListener('keydown', handler);
    }, [virtualItems, rowHeight]);

    if (variant === 'inline') {
        return (
            <div className={cn('eui-diff', className)} role="region" aria-label="Diff viewer">
                {(oldTitle || newTitle) && (
                    <div className="eui-diff-header">
                        {oldTitle && <div className="eui-diff-title-old">{oldTitle}</div>}
                        {newTitle && <div className="eui-diff-title-new">{newTitle}</div>}
                    </div>
                )}
                <div className="eui-diff-inline">
                    {rows.map((r, i) => {
                        if (r.type === 'equal') return <span key={i} className="eui-diff-inline-eq">{r.oldText}{'\n'}</span>;
                        if (r.type === 'insert') return <span key={i} className="eui-diff-inline-add">{r.newText}{'\n'}</span>;
                        if (r.type === 'delete') return <span key={i} className="eui-diff-inline-del">{r.oldText}{'\n'}</span>;
                        return (
                            <React.Fragment key={i}>
                                <span className="eui-diff-inline-del">{r.oldText}</span>
                                <span className="eui-diff-inline-add">{r.newText}</span>
                                {'\n'}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    }

    const isSplit = variant === 'split';
    const visibleItems = virtualItems.slice(startIdx, endIdx);

    return (
        <div className={cn('eui-diff', className)} role="region" aria-label="Diff viewer">
            {(oldTitle || newTitle) && (
                <div className="eui-diff-header">
                    {oldTitle && <div className="eui-diff-title-old">{oldTitle}</div>}
                    {newTitle && <div className="eui-diff-title-new">{newTitle}</div>}
                </div>
            )}
            <div
                ref={scrollRef}
                className="eui-diff-scroll"
                style={{ maxHeight }}
                onScroll={onScroll}
                tabIndex={0}
            >
                <div className="eui-diff-virt" style={{ height: totalHeight }}>
                    {visibleItems.map((item, idx) =>
                        isSplit ? renderSplitRow(item, startIdx + idx) : renderUnifiedRow(item, startIdx + idx),
                    )}
                    {(clippedOld.truncated || clippedNew.truncated) && (
                        <div
                            className="eui-diff-row"
                            style={{ top: virtualItems.length * rowHeight, height: rowHeight * 2 }}
                        >
                            <div className="eui-diff-hunk-skip" style={{ width: '100%' }}>
                                Comparison stopped at {maxLines} lines.
                                {clippedOld.truncated && ` Old file has ${clippedOld.originalLines} lines.`}
                                {clippedNew.truncated && ` New file has ${clippedNew.originalLines} lines.`}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export { DiffViewer };
export type { DiffViewerProps, DiffVariant };
