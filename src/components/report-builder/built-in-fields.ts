/**
 * Built-in fields are read-only values exposed under the `BuiltInFields.*` namespace in the
 * expression language. Two layers contribute entries:
 *
 * 1. Library-wide registry (managed through `initReportBuilder({ builtInFields })`). Host apps
 *    register their globals once at bootstrap and every Report Builder / Viewer instance picks
 *    them up automatically.
 * 2. Per-instance overrides passed via the `builtInFields` prop on `ReportBuilder` / `ReportViewer`.
 *    These win over the registry when the same name is declared in both places.
 *
 * The library itself ships zero entries by default — everything you can already get from a
 * function (`Now()`, `Today()`, etc.) intentionally lives in the function library, not here.
 * The namespace is there so hosts can expose first-class primitives (current user, tenant,
 * feature flags, environment) without wrapping them in dummy parameters.
 */

export interface BuiltInFieldDefinition {
    /** Identifier used inside expressions — must be a valid JS identifier. */
    name: string;
    /** Human-readable label shown in the builder UI. Defaults to `name`. */
    label?: string;
    /** Optional description shown alongside the label in the Fields panel. */
    description?: string;
    /** Optional grouping tag — fields with the same group are rendered together in the UI. */
    group?: string;
    /**
     * Constant value OR a zero-arg getter. Getters are invoked on every evaluation, so they
     * can return live data (e.g. `() => currentUser()`) or a Promise for async lookups.
     */
    value: unknown | (() => unknown) | (() => Promise<unknown>);
}

export interface ReportBuilderInitOptions {
    builtInFields?: BuiltInFieldDefinition[];
}

const registry: Map<string, BuiltInFieldDefinition> = new Map();

/**
 * Library-wide setup hook. Call once at bootstrap — typically from the host app's entry file —
 * before mounting any Report Builder / Viewer. Overwrites previous registrations for fields with
 * the same name so apps can re-configure during HMR without leaking stale entries.
 */
export function initReportBuilder(options: ReportBuilderInitOptions = {}): void {
    if (options.builtInFields) {
        for (const f of options.builtInFields) {
            registry.set(f.name, f);
        }
    }
}

/** Returns the current library-wide registry as a plain array. */
export function getRegisteredBuiltInFields(): BuiltInFieldDefinition[] {
    return Array.from(registry.values());
}

/** Clears every registered built-in field. Exposed for tests / HMR clean-up. */
export function clearRegisteredBuiltInFields(): void {
    registry.clear();
}

/**
 * Merge the library-wide registry with a per-instance override list. Override entries with the
 * same `name` win. Returns the merged definitions in registry-then-override order.
 */
export function mergeBuiltInFields(
    overrides: BuiltInFieldDefinition[] | undefined,
): BuiltInFieldDefinition[] {
    if (!overrides || overrides.length === 0) return getRegisteredBuiltInFields();
    const byName = new Map<string, BuiltInFieldDefinition>();
    for (const f of registry.values()) byName.set(f.name, f);
    for (const f of overrides) byName.set(f.name, f);
    return Array.from(byName.values());
}

/**
 * Project the merged definitions into the `builtInFields` shape accepted by the expression
 * engine (`Record<string, unknown | (() => unknown)>`). Getter wrapping is preserved so the
 * evaluator can resolve them lazily.
 */
export function builtInFieldsToExpressionContext(
    fields: BuiltInFieldDefinition[],
): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const f of fields) out[f.name] = f.value;
    return out;
}
