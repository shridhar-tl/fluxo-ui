import { getActiveDrag } from '../core/registry';
import type { ActiveDrag } from '../core/types';
import { useGlobalDndStore } from './useSyncExternal';

export interface DragLayerState {
    isDragging: boolean;
    item: ActiveDrag['item'] | null;
    point: { x: number; y: number } | null;
    offset: { x: number; y: number } | null;
    path: 'html5' | 'pointer' | null;
}

export function useDragLayer(): DragLayerState {
    return useGlobalDndStore(() => {
        const active = getActiveDrag();
        if (!active) {
            return { isDragging: false, item: null, point: null, offset: null, path: null };
        }
        return {
            isDragging: true,
            item: active.item,
            point: active.currentPoint,
            offset: active.offsetWithinSource,
            path: active.path,
        };
    });
}
