export interface StoredShellState {
    collapsed?: boolean;
    width?: number;
}

export const readShellState = (key: string | undefined): StoredShellState => {
    if (!key || typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return {};
        const record = parsed as Record<string, unknown>;
        return {
            collapsed: typeof record.collapsed === 'boolean' ? record.collapsed : undefined,
            width: typeof record.width === 'number' && Number.isFinite(record.width) ? record.width : undefined,
        };
    } catch {
        return {};
    }
};

export const writeShellState = (key: string | undefined, state: StoredShellState) => {
    if (!key || typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
        return;
    }
};

const namedBreakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 };

export const resolveBreakpoint = (value: 'sm' | 'md' | 'lg' | 'xl' | number): number =>
    typeof value === 'number' ? value : namedBreakpoints[value];
