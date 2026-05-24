const isDevEnvironment = (): boolean => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
            return process.env.NODE_ENV !== 'production';
        }
    } catch {
        // ignore
    }
    return true;
};

const warnedManagers = new Set<string>();

export const warnManagerMissing = (manager: string, callName: string, mountHint: string): void => {
    if (!isDevEnvironment()) return;
    if (warnedManagers.has(manager)) return;
    warnedManagers.add(manager);
    // eslint-disable-next-line no-console
    console.warn(
        `[FluxoUI] ${callName}() was called but <${manager} /> is not mounted, so nothing will show. ` +
            `Mount it once at your app root: ${mountHint}`,
    );
};
