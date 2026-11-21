import type { CustomFunction } from './expression-types';

const registry: Map<string, CustomFunction> = new Map();

export function registerFunctions(functions: CustomFunction[]): void {
    for (const fn of functions) {
        registry.set(fn.name.toLowerCase(), fn);
    }
}

export function getRegisteredFunctions(): CustomFunction[] {
    return Array.from(registry.values());
}

export function clearRegisteredFunctions(): void {
    registry.clear();
}
