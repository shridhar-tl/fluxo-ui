import { installDocumentDragListeners } from './html5Path';

let installed = false;
let uninstall: (() => void) | null = null;

export function ensureDocumentListeners() {
    if (installed) return;
    if (typeof document === 'undefined') return;
    installed = true;
    const remove = installDocumentDragListeners();
    uninstall = typeof remove === 'function' ? remove : null;
}

export function teardownDocumentListeners() {
    if (!installed) return;
    installed = false;
    uninstall?.();
    uninstall = null;
}
