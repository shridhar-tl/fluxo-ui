import type {
    DashboardBreakpoint,
    DashboardBreakpointKey,
    DashboardLayouts,
    DashboardWidget,
    WidgetLayout,
} from './dashboard-layout-types';
import { defaultBreakpoints } from './dashboard-layout-types';

export function resolveActiveBreakpoint(
    width: number,
    breakpoints: DashboardBreakpoint[],
): DashboardBreakpoint {
    const list = breakpoints.length ? breakpoints : defaultBreakpoints;
    const sorted = [...list].sort((a, b) => b.minWidth - a.minWidth);
    return sorted.find((b) => width >= b.minWidth) ?? sorted[sorted.length - 1];
}

export function getLayoutForBreakpoint(
    layouts: DashboardLayouts,
    bpKey: string,
    breakpoints: DashboardBreakpoint[],
): WidgetLayout[] | undefined {
    if (layouts[bpKey]?.length) return layouts[bpKey];
    const sorted = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth);
    const startIdx = sorted.findIndex((b) => b.key === bpKey);
    if (startIdx === -1) {
        const firstAvailable = sorted.map((b) => layouts[b.key]).find((l) => l && l.length);
        return firstAvailable;
    }
    for (let i = startIdx - 1; i >= 0; i--) {
        const candidate = layouts[sorted[i].key];
        if (candidate?.length) return candidate;
    }
    for (let i = startIdx + 1; i < sorted.length; i++) {
        const candidate = layouts[sorted[i].key];
        if (candidate?.length) return candidate;
    }
    return undefined;
}

export function generateAutoLayout(
    widgets: DashboardWidget[],
    columns: number,
): WidgetLayout[] {
    const layout: WidgetLayout[] = [];
    let cursorX = 0;
    let cursorY = 0;
    const defaultW = Math.max(3, Math.floor(columns / 3));
    const defaultH = 4;

    widgets.filter((w) => !w.hidden).forEach((widget) => {
        const w = Math.min(defaultW, columns);
        if (cursorX + w > columns) {
            cursorX = 0;
            cursorY += defaultH;
        }
        layout.push({
            id: widget.id,
            x: cursorX,
            y: cursorY,
            w,
            h: defaultH,
        });
        cursorX += w;
    });
    return layout;
}

export function scaleLayoutToColumns(layout: WidgetLayout[], fromCols: number, toCols: number): WidgetLayout[] {
    if (fromCols === toCols) return layout.map((l) => ({ ...l }));
    const ratio = toCols / fromCols;
    return layout.map((l) => {
        const newW = Math.max(1, Math.min(toCols, Math.round(l.w * ratio)));
        const newX = Math.max(0, Math.min(toCols - newW, Math.round(l.x * ratio)));
        return { ...l, x: newX, w: newW };
    });
}

export function ensureLayoutForBreakpoint(
    layouts: DashboardLayouts,
    bp: DashboardBreakpoint,
    widgets: DashboardWidget[],
    allBreakpoints: DashboardBreakpoint[],
): WidgetLayout[] {
    const existing = layouts[bp.key];
    if (existing && existing.length) {
        const visibleIds = new Set(widgets.filter((w) => !w.hidden).map((w) => w.id));
        const knownIds = new Set(existing.map((l) => l.id));
        const filtered = existing.filter((l) => visibleIds.has(l.id));
        const missing = widgets
            .filter((w) => !w.hidden && !knownIds.has(w.id))
            .map((widget, idx) => {
                const defaultW = Math.max(3, Math.floor(bp.columns / 3));
                const y = filtered.reduce((max, l) => Math.max(max, l.y + l.h), 0);
                return {
                    id: widget.id,
                    x: (idx * defaultW) % bp.columns,
                    y,
                    w: Math.min(defaultW, bp.columns),
                    h: 4,
                } satisfies WidgetLayout;
            });
        return [...filtered, ...missing];
    }
    const inherited = getLayoutForBreakpoint(layouts, bp.key, allBreakpoints);
    if (inherited && inherited.length) {
        const sorted = [...allBreakpoints].sort((a, b) => b.minWidth - a.minWidth);
        const sourceBp = sorted.find((b) => layouts[b.key] === inherited);
        if (sourceBp) {
            return scaleLayoutToColumns(inherited, sourceBp.columns, bp.columns);
        }
        return inherited.map((l) => ({ ...l }));
    }
    return generateAutoLayout(widgets, bp.columns);
}

export function compactLayoutVertical(layout: WidgetLayout[]): WidgetLayout[] {
    const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    const compacted: WidgetLayout[] = [];
    sorted.forEach((item) => {
        let y = 0;
        while (collides({ ...item, y }, compacted)) y++;
        compacted.push({ ...item, y });
    });
    return compacted;
}

export function collides(item: WidgetLayout, others: WidgetLayout[]): boolean {
    return others.some((other) => {
        if (other.id === item.id) return false;
        if (item.x + item.w <= other.x) return false;
        if (item.x >= other.x + other.w) return false;
        if (item.y + item.h <= other.y) return false;
        if (item.y >= other.y + other.h) return false;
        return true;
    });
}

export function moveWidget(
    layout: WidgetLayout[],
    id: string,
    nextX: number,
    nextY: number,
    columns: number,
    allowOverlap: boolean,
): WidgetLayout[] {
    const target = layout.find((l) => l.id === id);
    if (!target) return layout;
    const clampedX = Math.max(0, Math.min(columns - target.w, nextX));
    const clampedY = Math.max(0, nextY);
    const others = layout.filter((l) => l.id !== id);
    const moved: WidgetLayout = { ...target, x: clampedX, y: clampedY };

    if (allowOverlap || !collides(moved, others)) {
        return compactLayoutVertical([...others, moved]);
    }

    const pushed = resolveCollisionsByPushDown(moved, others);
    return compactLayoutVertical([...pushed, moved]);
}

function resolveCollisionsByPushDown(item: WidgetLayout, others: WidgetLayout[]): WidgetLayout[] {
    const adjusted = others.map((other) => ({ ...other }));
    let changed = true;
    let safety = 0;
    while (changed && safety < 200) {
        changed = false;
        safety++;
        for (const other of adjusted) {
            if (collides(item, [other])) {
                other.y = item.y + item.h;
                changed = true;
            }
        }
    }
    return adjusted;
}

export function resizeWidget(
    layout: WidgetLayout[],
    id: string,
    nextW: number,
    nextH: number,
    columns: number,
    allowOverlap: boolean,
): WidgetLayout[] {
    const target = layout.find((l) => l.id === id);
    if (!target) return layout;
    const minW = target.minW ?? 1;
    const minH = target.minH ?? 1;
    const maxW = Math.min(target.maxW ?? columns, columns);
    const maxH = target.maxH ?? 100;
    const w = Math.max(minW, Math.min(maxW, nextW));
    const h = Math.max(minH, Math.min(maxH, nextH));
    const clampedX = Math.max(0, Math.min(columns - w, target.x));
    const others = layout.filter((l) => l.id !== id);
    const resized: WidgetLayout = { ...target, x: clampedX, w, h };

    if (allowOverlap || !collides(resized, others)) {
        return compactLayoutVertical([...others, resized]);
    }
    const pushed = resolveCollisionsByPushDown(resized, others);
    return compactLayoutVertical([...pushed, resized]);
}

export function removeWidgetFromLayout(layout: WidgetLayout[], id: string): WidgetLayout[] {
    return compactLayoutVertical(layout.filter((l) => l.id !== id));
}

export function addWidgetToLayout(layout: WidgetLayout[], widget: DashboardWidget, columns: number): WidgetLayout[] {
    const defaultW = Math.max(3, Math.floor(columns / 3));
    const maxY = layout.reduce((max, l) => Math.max(max, l.y + l.h), 0);
    const newItem: WidgetLayout = {
        id: widget.id,
        x: 0,
        y: maxY,
        w: Math.min(defaultW, columns),
        h: 4,
    };
    return compactLayoutVertical([...layout, newItem]);
}

export function persistLayoutsToStorage(key: string, state: unknown): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
        /* swallow quota / privacy errors */
    }
}

export function loadLayoutsFromStorage<T>(key: string): T | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export type { DashboardBreakpointKey };
