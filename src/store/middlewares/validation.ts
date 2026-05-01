import { Store } from '../types';

export type ValidationErrors = Record<string, string>;

export type ValidationFn<T> = (state: T) => ValidationErrors | undefined | null | false;

export interface SafeParseSchema<T> {
    safeParse: (state: T) => { success: true; data?: any } | { success: false; error: { issues?: any[]; errors?: any[]; message?: string } };
}

export interface ParseSchema<T> {
    parse: (state: T) => unknown;
}

export type SchemaLike<T> = SafeParseSchema<T> | ParseSchema<T>;

export interface ValidationOptions<T> {
    validator?: ValidationFn<T>;
    schema?: SchemaLike<T>;
    asyncValidator?: (state: T) => Promise<ValidationErrors | undefined | null | false>;
    onValidationError?: (errors: ValidationErrors) => void;
    behavior?: 'reject' | 'warn';
}

const isSafeParseSchema = (s: any): s is SafeParseSchema<any> => s && typeof s.safeParse === 'function';
const isParseSchema = (s: any): s is ParseSchema<any> => s && typeof s.parse === 'function';

const issuesToErrors = (issues: any[] | undefined): ValidationErrors => {
    const out: ValidationErrors = {};
    if (!Array.isArray(issues)) return out;
    for (const issue of issues) {
        const path = Array.isArray(issue?.path) ? issue.path.join('.') : String(issue?.path ?? '_');
        const msg = String(issue?.message ?? 'Invalid');
        if (!out[path]) out[path] = msg;
    }
    return out;
};

const runSchema = <T>(schema: SchemaLike<T>, state: T): ValidationErrors | undefined => {
    if (isSafeParseSchema(schema)) {
        const result = schema.safeParse(state);
        if (result.success) return undefined;
        const issues = result.error.issues ?? result.error.errors ?? [];
        if (issues.length) return issuesToErrors(issues);
        return { _: result.error.message ?? 'Validation failed' };
    }
    if (isParseSchema(schema)) {
        try {
            schema.parse(state);
            return undefined;
        } catch (err: any) {
            const issues = err?.issues ?? err?.errors;
            if (Array.isArray(issues)) return issuesToErrors(issues);
            return { _: err?.message ?? String(err) };
        }
    }
    return undefined;
};

export function validationMiddleware<T>(opts: ValidationOptions<T>) {
    const behavior = opts.behavior ?? 'reject';

    return (store: Store<T>): Store<T> => {
        const originalSetState = store.setState;

        const reportErrors = (errors: ValidationErrors) => {
            if (opts.onValidationError) opts.onValidationError(errors);
        };

        const computeNextState = (stateOrUpdater: any, replace: boolean): T => {
            const current = store.getState();
            if (typeof stateOrUpdater === 'function') {
                const patch = stateOrUpdater(current);
                return replace ? (patch as T) : ({ ...(current as any), ...(patch as any) } as T);
            }
            return replace ? (stateOrUpdater as T) : ({ ...(current as any), ...(stateOrUpdater as any) } as T);
        };

        store.setState = (stateOrUpdater: any, param2?: any, param3?: any) => {
            let afterApply: ((state: T) => void) | undefined;
            let replace = false;
            if (typeof param2 === 'function') {
                afterApply = param2;
                replace = param3 === true;
            } else if (typeof param2 === 'boolean') {
                replace = param2;
            }

            const nextState = computeNextState(stateOrUpdater, replace);

            let errors: ValidationErrors | undefined;
            if (opts.validator) {
                const result = opts.validator(nextState);
                if (result && Object.keys(result).length > 0) errors = result;
            }
            if (!errors && opts.schema) {
                errors = runSchema(opts.schema, nextState);
            }

            if (errors && Object.keys(errors).length > 0) {
                reportErrors(errors);
                if (behavior === 'reject') return;
            }

            originalSetState(stateOrUpdater, afterApply as any, replace);

            if (opts.asyncValidator) {
                Promise.resolve()
                    .then(() => opts.asyncValidator!(store.getState()))
                    .then((asyncErrors) => {
                        if (asyncErrors && Object.keys(asyncErrors).length > 0) {
                            reportErrors(asyncErrors);
                        }
                    })
                    .catch((err) => {
                        reportErrors({ _: err?.message ?? String(err) });
                    });
            }
        };

        return store;
    };
}

