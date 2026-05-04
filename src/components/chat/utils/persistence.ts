import type { ChatPersist } from '../types';

function getStorage(persist: ChatPersist | undefined): Storage | null {
    if (!persist) return null;
    if (typeof window === 'undefined') return null;
    if (persist === 'session') return window.sessionStorage;
    return window.localStorage;
}

export function readStored<T>(persist: ChatPersist | undefined, key: string): T | null {
    const storage = getStorage(persist);
    if (!storage) return null;
    try {
        const raw = storage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function writeStored(persist: ChatPersist | undefined, key: string, value: unknown): void {
    const storage = getStorage(persist);
    if (!storage) return;
    try {
        storage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore quota errors
    }
}

export function clearStored(persist: ChatPersist | undefined, key: string): void {
    const storage = getStorage(persist);
    if (!storage) return;
    try {
        storage.removeItem(key);
    } catch {
        // ignore
    }
}
