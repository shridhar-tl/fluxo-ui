import type { DatasetField, DerivedTransform } from '../report-definition-types';
import { aggregateResultType, findField } from './value-utils';

export interface DerivedSchemaRuntime {
    resolveFields: (datasourceId: string) => Promise<DatasetField[]>;
    getDatasourceName: (datasourceId: string) => string;
}

const fieldRefPattern = /^\s*Field\.([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*$/;

function fieldTypeOfExpression(fields: DatasetField[], expression: string | undefined): DatasetField | undefined {
    if (!expression) return undefined;
    const match = fieldRefPattern.exec(expression);
    return match ? findField(fields, match[1]) : undefined;
}

function upsert(fields: DatasetField[], field: DatasetField): DatasetField[] {
    const idx = fields.findIndex((f) => f.name === field.name);
    if (idx === -1) return [...fields, field];
    const next = [...fields];
    next[idx] = field;
    return next;
}

function mergeFields(base: DatasetField[], extra: DatasetField[]): DatasetField[] {
    let out = base;
    for (const f of extra) {
        if (!out.some((x) => x.name === f.name)) out = [...out, f];
    }
    return out;
}

export async function inferTransformSchema(
    transform: DerivedTransform,
    fields: DatasetField[],
    runtime: DerivedSchemaRuntime,
): Promise<DatasetField[]> {
    switch (transform.type) {
        case 'flatten': {
            const child = findField(fields, transform.childField);
            if (!child) return fields;
            const rest = fields.filter((f) => f.name !== transform.childField);
            const childFields = (child.children ?? []).map((c) => ({ ...c, name: `${transform.childPrefix ?? ''}${c.name}` }));
            return mergeFields(rest, childFields);
        }
        case 'pick': {
            const picked = transform.fields.filter((f) => f.source.trim());
            if (picked.length === 0) return fields;
            return picked.map(({ source, alias }) => {
                const src = findField(fields, source);
                return { ...(src ?? { type: 'string' as const }), name: alias?.trim() || source };
            });
        }
        case 'filter':
        case 'sort':
        case 'limit':
            return fields;
        case 'computed': {
            let out = fields;
            for (const col of transform.columns) {
                if (!col.name.trim()) continue;
                const src = fieldTypeOfExpression(out, col.expression);
                out = upsert(out, { ...(src ?? { type: 'string' as const }), name: col.name.trim() });
            }
            return out;
        }
        case 'group': {
            const out: DatasetField[] = [];
            for (const k of transform.keys) {
                if (!k.name.trim()) continue;
                const src = fieldTypeOfExpression(fields, k.expression);
                out.push({ ...(src ?? { type: 'string' as const }), name: k.name.trim() });
            }
            for (const a of transform.aggregates) {
                if (!a.name.trim()) continue;
                const src = fieldTypeOfExpression(fields, a.expression);
                out.push({ name: a.name.trim(), type: aggregateResultType(a.fn, src?.type) });
            }
            if (transform.rowsField?.trim()) {
                out.push({ name: transform.rowsField.trim(), type: 'array', children: fields });
            }
            return out;
        }
        case 'join': {
            if (!transform.datasourceId) return fields;
            const rightFields = await runtime.resolveFields(transform.datasourceId);
            if (transform.mode === 'nest') {
                const nestAs = transform.nestAs?.trim() || runtime.getDatasourceName(transform.datasourceId);
                return upsert(fields, { name: nestAs, type: 'array', children: rightFields });
            }
            const prefixed = rightFields.map((f) => ({ ...f, name: `${transform.prefix ?? ''}${f.name}` }));
            let out = fields;
            for (const f of prefixed) out = upsert(out, f);
            return out;
        }
        case 'union': {
            let out = fields;
            for (const id of transform.datasourceIds) {
                out = mergeFields(out, await runtime.resolveFields(id));
            }
            if (transform.sourceField?.trim()) out = upsert(out, { name: transform.sourceField.trim(), type: 'string' });
            return out;
        }
        case 'distinct': {
            const active = transform.fields.filter((f) => f.trim());
            if (active.length === 0) return fields;
            return active.map((path) => ({ ...(findField(fields, path) ?? { type: 'string' as const }), name: path }));
        }
        case 'pivot': {
            const rowFields = transform.rowFields
                .filter((f) => f.trim())
                .map((path) => ({ ...(findField(fields, path) ?? { type: 'string' as const }), name: path }));
            return rowFields;
        }
        case 'unpivot': {
            const removed = new Set(transform.fields);
            const firstSource = transform.fields.map((f) => findField(fields, f)).find(Boolean);
            return [
                ...fields.filter((f) => !removed.has(f.name)),
                { name: transform.nameField.trim() || 'name', type: 'string' },
                { name: transform.valueField.trim() || 'value', type: firstSource?.type ?? 'string' },
            ];
        }
        case 'window': {
            let out = fields;
            for (const col of transform.columns) {
                if (!col.name.trim()) continue;
                const src = col.field ? findField(fields, col.field) : undefined;
                const type = col.fn === 'previous' || col.fn === 'next' ? (src?.type ?? 'string') : 'number';
                out = upsert(out, { name: col.name.trim(), type });
            }
            return out;
        }
        default:
            return fields;
    }
}

export async function inferDerivedSchema(
    sourceFields: DatasetField[],
    transforms: DerivedTransform[],
    runtime: DerivedSchemaRuntime,
): Promise<DatasetField[]> {
    let fields = sourceFields;
    for (const t of transforms) {
        fields = await inferTransformSchema(t, fields, runtime);
    }
    return fields;
}
