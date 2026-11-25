import { useMemo } from 'react';

const maxBodyHeight = 8_000_000;

export type ScrollAlign = 'start' | 'center' | 'end' | 'auto';

export interface VirtualMetrics {
    start: number;
    end: number;
    windowTop: number;
    bodyHeight: number;
    totalHeight: number;
    offsetOf: (index: number) => number;
    heightOf: (index: number) => number;
    toScrollTop: (virtualOffset: number) => number;
    toVirtual: (scrollTop: number) => number;
    targetScrollTop: (index: number, align: ScrollAlign, currentScrollTop: number) => number;
    rowsPerPage: number;
}

const findIndex = (offsets: Float64Array, count: number, value: number): number => {
    let low = 0;
    let high = count - 1;
    let result = 0;
    while (low <= high) {
        const mid = (low + high) >> 1;
        if (offsets[mid] <= value) {
            result = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return result;
};

export const useRowOffsets = (count: number, fixedHeight: number, heightAt: ((index: number) => number) | null): Float64Array | null =>
    useMemo(() => {
        if (!heightAt) return null;
        const offsets = new Float64Array(count + 1);
        for (let i = 0; i < count; i += 1) offsets[i + 1] = offsets[i] + Math.max(heightAt(i), fixedHeight > 0 ? 1 : 0);
        return offsets;
    }, [count, fixedHeight, heightAt]);

export const useTreeTableVirtual = (
    count: number,
    fixedHeight: number,
    offsets: Float64Array | null,
    viewport: number,
    scrollTop: number,
    overscan: number,
): VirtualMetrics =>
    useMemo(() => {
        const totalHeight = offsets ? offsets[count] : count * fixedHeight;
        const bodyHeight = Math.min(totalHeight, maxBodyHeight);
        const scaled = totalHeight > bodyHeight && bodyHeight > viewport;
        const ratio = scaled ? (totalHeight - viewport) / (bodyHeight - viewport) : 1;
        const toVirtual = (top: number) => Math.max(0, Math.min(top * ratio, Math.max(totalHeight - viewport, 0)));
        const toScrollTop = (virtualOffset: number) => Math.max(0, virtualOffset / ratio);
        const offsetOf = (index: number) => (offsets ? offsets[Math.max(0, Math.min(index, count))] : index * fixedHeight);
        const heightOf = (index: number) => (offsets ? offsets[index + 1] - offsets[index] : fixedHeight);
        const indexAt = (value: number) => {
            if (count === 0) return 0;
            if (offsets) return findIndex(offsets, count, value);
            return Math.min(count - 1, Math.max(0, Math.floor(value / Math.max(fixedHeight, 1))));
        };
        const virtualTop = toVirtual(scrollTop);
        const first = indexAt(virtualTop);
        const last = indexAt(virtualTop + Math.max(viewport, fixedHeight));
        const start = Math.max(0, first - overscan);
        const end = count === 0 ? -1 : Math.min(count - 1, last + overscan);
        const windowTop = scaled ? scrollTop + offsetOf(start) - virtualTop : offsetOf(start);
        const rowsPerPage = Math.max(1, Math.floor(viewport / Math.max(fixedHeight, 1)) - 1);
        const targetScrollTop = (index: number, align: ScrollAlign, currentScrollTop: number) => {
            const top = offsetOf(index);
            const height = heightOf(index);
            const currentVirtual = toVirtual(currentScrollTop);
            let target = currentVirtual;
            if (align === 'start') target = top;
            else if (align === 'end') target = top + height - viewport;
            else if (align === 'center') target = top - (viewport - height) / 2;
            else if (top < currentVirtual) target = top;
            else if (top + height > currentVirtual + viewport) target = top + height - viewport;
            if (target === currentVirtual) return currentScrollTop;
            return toScrollTop(Math.max(0, Math.min(target, Math.max(totalHeight - viewport, 0))));
        };
        return { start, end, windowTop, bodyHeight, totalHeight, offsetOf, heightOf, toScrollTop, toVirtual, targetScrollTop, rowsPerPage };
    }, [count, fixedHeight, offsets, viewport, scrollTop, overscan]);
