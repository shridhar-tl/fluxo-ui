import type React from 'react';
import { useMemo } from 'react';

import type { TreeTableBreakpoint, TreeTableColumn, TreeTableFrozen, TreeTableRowData } from './tree-table-types';

export interface ResolvedColumn<T extends TreeTableRowData> {
    column: TreeTableColumn<T>;
    key: string;
    index: number;
    frozen: TreeTableFrozen | null;
    stickyStyle: React.CSSProperties | undefined;
    isLastLeftFrozen: boolean;
    isFirstRightFrozen: boolean;
    width: number | null;
}

export interface ColumnGroupSpan {
    label: string;
    start: number;
    span: number;
}

export interface ColumnLayout<T extends TreeTableRowData> {
    columns: ResolvedColumn<T>[];
    template: string;
    minWidth: number;
    groups: ColumnGroupSpan[] | null;
}

const breakpointWidths: Record<TreeTableBreakpoint, number> = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 };
const defaultMinWidth = 120;
const defaultFrozenWidth = 160;

const clampWidth = <T extends TreeTableRowData>(column: TreeTableColumn<T>, width: number): number => {
    const min = column.minWidth ?? 48;
    const max = column.maxWidth ?? Infinity;
    return Math.min(Math.max(width, min), max);
};

const pixelValue = (value: string): number | null => {
    const match = /^(\d+(?:\.\d+)?)px$/.exec(value.trim());
    return match ? Number(match[1]) : null;
};

export const useTreeTableColumns = <T extends TreeTableRowData>(
    columns: TreeTableColumn<T>[],
    order: string[] | null,
    widths: Record<string, number>,
    containerWidth: number,
): ColumnLayout<T> =>
    useMemo(() => {
        const position = new Map<string, number>();
        if (order) order.forEach((key, index) => position.set(key, index));
        const visible = columns
            .map((column, index) => ({ column, index }))
            .filter(({ column }) => {
                if (column.hidden) return false;
                if (column.hideBelow && containerWidth > 0 && containerWidth < breakpointWidths[column.hideBelow]) return false;
                return true;
            })
            .sort((a, b) => {
                const rank = (column: TreeTableColumn<T>) => (column.frozen === 'left' ? 0 : column.frozen === 'right' ? 2 : 1);
                const byFrozen = rank(a.column) - rank(b.column);
                if (byFrozen) return byFrozen;
                const posA = position.get(a.column.key) ?? columns.length + a.index;
                const posB = position.get(b.column.key) ?? columns.length + b.index;
                return posA - posB;
            });

        const tracks: string[] = [];
        const pixelWidths: (number | null)[] = [];
        let minWidth = 0;
        visible.forEach(({ column }) => {
            const override = widths[column.key];
            const declared = override ?? column.width;
            if (typeof declared === 'number') {
                const width = clampWidth(column, declared);
                tracks.push(`${width}px`);
                pixelWidths.push(width);
                minWidth += width;
                return;
            }
            if (column.frozen) {
                const width = clampWidth(column, (typeof declared === 'string' ? pixelValue(declared) : null) ?? column.minWidth ?? defaultFrozenWidth);
                tracks.push(`${width}px`);
                pixelWidths.push(width);
                minWidth += width;
                return;
            }
            const min = column.minWidth ?? defaultMinWidth;
            if (typeof declared === 'string') {
                const px = pixelValue(declared);
                tracks.push(px !== null ? `${px}px` : `minmax(${min}px, ${declared})`);
                pixelWidths.push(px);
                minWidth += px ?? min;
                return;
            }
            tracks.push(column.maxWidth ? `minmax(${min}px, ${column.maxWidth}px)` : `minmax(${min}px, 1fr)`);
            pixelWidths.push(null);
            minWidth += min;
        });

        const resolved: ResolvedColumn<T>[] = visible.map(({ column }, index) => ({
            column,
            key: column.key,
            index,
            frozen: column.frozen ?? null,
            stickyStyle: undefined,
            isLastLeftFrozen: false,
            isFirstRightFrozen: false,
            width: pixelWidths[index],
        }));

        let left = 0;
        let lastLeft = -1;
        resolved.forEach((entry, index) => {
            if (entry.frozen !== 'left') return;
            entry.stickyStyle = { left };
            left += entry.width ?? 0;
            lastLeft = index;
        });
        if (lastLeft >= 0) resolved[lastLeft].isLastLeftFrozen = true;
        let right = 0;
        let firstRight = -1;
        for (let index = resolved.length - 1; index >= 0; index -= 1) {
            const entry = resolved[index];
            if (entry.frozen !== 'right') continue;
            entry.stickyStyle = { right };
            right += entry.width ?? 0;
            firstRight = index;
        }
        if (firstRight >= 0) resolved[firstRight].isFirstRightFrozen = true;

        let groups: ColumnGroupSpan[] | null = null;
        if (resolved.some((entry) => entry.column.group)) {
            groups = [];
            resolved.forEach((entry, index) => {
                const label = entry.column.group ?? '';
                const previous = groups?.[groups.length - 1];
                if (previous && previous.label === label && previous.start + previous.span === index) previous.span += 1;
                else groups?.push({ label, start: index, span: 1 });
            });
        }

        return { columns: resolved, template: tracks.join(' '), minWidth, groups };
    }, [columns, order, widths, containerWidth]);
