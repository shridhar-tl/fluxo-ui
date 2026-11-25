import type React from 'react';
import { useCallback } from 'react';

import type { FlatItem } from './tree-table-data';
import type { TreeTableRowData, TreeTableSelectionMode } from './tree-table-types';
import { useLatest } from './useTreeTableState';

export type KeyboardMoveDirection = 'up' | 'down' | 'in' | 'out';

export interface KeyboardApi<T extends TreeTableRowData> {
    items: FlatItem<T>[];
    columnCount: number;
    rowsPerPage: number;
    selectionMode: TreeTableSelectionMode;
    rowReorder: boolean;
    moveFocus: (index: number, column: number) => void;
    toggle: (index: number) => void;
    select: (index: number, event: React.KeyboardEvent) => void;
    extendSelection: (from: number, to: number) => void;
    selectAll: () => void;
    expandSiblings: (index: number) => void;
    startEdit: (index: number, column: number) => boolean;
    activateStatus: (index: number) => void;
    moveRow: (index: number, direction: KeyboardMoveDirection) => void;
    activateRow: (index: number) => void;
}

const focusableSelector = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const readIndex = (element: HTMLElement, attribute: string): number | null => {
    const value = element.getAttribute(attribute);
    if (value === null) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
};

export const useTreeTableKeyboard = <T extends TreeTableRowData>(api: KeyboardApi<T>) => {
    const apiRef = useLatest(api);

    return useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const current = apiRef.current;
        const isRowTarget = target.getAttribute('role') === 'row' && target.hasAttribute('data-tt-index');
        const isCellTarget = target.hasAttribute('data-tt-col');
        if (!isRowTarget && !isCellTarget) {
            if (event.key === 'Escape') {
                const cell = target.closest<HTMLElement>('[data-tt-col]');
                if (cell) {
                    event.preventDefault();
                    cell.focus();
                }
            }
            return;
        }
        const rowElement = isRowTarget ? target : target.closest<HTMLElement>('[data-tt-index]');
        if (!rowElement) return;
        const index = readIndex(rowElement, 'data-tt-index');
        if (index === null) return;
        const column = isCellTarget ? readIndex(target, 'data-tt-col') ?? -1 : -1;
        const { items, columnCount, rowsPerPage } = current;
        const item = items[index];
        if (!item) return;
        const isRow = item.kind === 'row';
        const lastIndex = items.length - 1;
        const ctrl = event.ctrlKey || event.metaKey;
        const handled = () => {
            event.preventDefault();
            event.stopPropagation();
        };

        if (event.altKey && current.rowReorder && isRow && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            handled();
            const map: Record<string, KeyboardMoveDirection> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'out', ArrowRight: 'in' };
            current.moveRow(index, map[event.key]);
            return;
        }

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                handled();
                const next = Math.max(0, Math.min(lastIndex, index + (event.key === 'ArrowDown' ? 1 : -1)));
                if (event.shiftKey && current.selectionMode === 'multiple') current.extendSelection(index, next);
                current.moveFocus(next, column);
                return;
            }
            case 'PageDown':
            case 'PageUp': {
                handled();
                const delta = event.key === 'PageDown' ? rowsPerPage : -rowsPerPage;
                current.moveFocus(Math.max(0, Math.min(lastIndex, index + delta)), column);
                return;
            }
            case 'Home':
                handled();
                if (column >= 0 && !ctrl) current.moveFocus(index, 0);
                else current.moveFocus(0, column);
                return;
            case 'End':
                handled();
                if (column >= 0 && !ctrl) current.moveFocus(index, columnCount - 1);
                else current.moveFocus(lastIndex, column);
                return;
            case 'ArrowRight': {
                handled();
                if (column >= 0) {
                    if (column < columnCount - 1) current.moveFocus(index, column + 1);
                    return;
                }
                if (isRow && item.hasChildren && !item.expanded) current.toggle(index);
                else if (isRow) current.moveFocus(index, 0);
                return;
            }
            case 'ArrowLeft': {
                handled();
                if (column > 0) {
                    current.moveFocus(index, column - 1);
                    return;
                }
                if (column === 0) {
                    current.moveFocus(index, -1);
                    return;
                }
                if (isRow && item.expanded) current.toggle(index);
                else if (item.parentIndex >= 0) current.moveFocus(item.parentIndex, -1);
                return;
            }
            case 'Enter':
            case 'F2': {
                handled();
                if (!isRow) {
                    current.activateStatus(index);
                    return;
                }
                if (column >= 0) {
                    if (current.startEdit(index, column)) return;
                    if (event.key === 'Enter') {
                        const inner = target.querySelector<HTMLElement>(focusableSelector);
                        if (inner) {
                            inner.focus();
                            return;
                        }
                    }
                }
                if (event.key === 'Enter') current.activateRow(index);
                return;
            }
            case ' ':
            case 'Spacebar': {
                if (!isRow) return;
                handled();
                if (current.selectionMode !== 'none') current.select(index, event);
                else if (item.hasChildren) current.toggle(index);
                return;
            }
            case '*':
                if (!isRow) return;
                handled();
                current.expandSiblings(index);
                return;
            case 'a':
            case 'A':
                if (!ctrl || (current.selectionMode !== 'multiple' && current.selectionMode !== 'checkbox')) return;
                handled();
                current.selectAll();
                return;
            default:
        }
    }, [apiRef]);
};
