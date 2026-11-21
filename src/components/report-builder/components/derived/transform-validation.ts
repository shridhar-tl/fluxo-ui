import { validateExpression } from '../../expression/expression-parser';
import type { DerivedTransform } from '../../report-definition-types';
import { windowFunctionsWithField } from './transform-catalog';

const identifierPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;

function expressionIssue(label: string, expression: string | undefined, required = true): string | null {
    const value = expression?.trim() ?? '';
    if (!value) return required ? `${label} is required.` : null;
    const [first] = validateExpression(value);
    return first ? `${label}: ${first.message}` : null;
}

function nameIssues(label: string, names: string[]): string[] {
    const issues: string[] = [];
    const seen = new Set<string>();
    names.forEach((raw, i) => {
        const name = raw.trim();
        if (!name) issues.push(`${label} ${i + 1} needs a name.`);
        else if (!identifierPattern.test(name)) issues.push(`"${name}" is not a valid name. Use letters, digits and underscores, starting with a letter.`);
        else if (seen.has(name)) issues.push(`The name "${name}" is used more than once.`);
        seen.add(name);
    });
    return issues;
}

function compact(values: Array<string | null>): string[] {
    return values.filter((v): v is string => !!v);
}

/** Problems that stop the step from producing the intended rows. An empty list means the step is valid. */
export function validateTransform(t: DerivedTransform): string[] {
    switch (t.type) {
        case 'filter':
            return compact([expressionIssue('The condition', t.expression)]);
        case 'computed':
            if (t.columns.length === 0) return ['Add at least one column.'];
            return [...nameIssues('Column', t.columns.map((c) => c.name)), ...compact(t.columns.map((c, i) => expressionIssue(`Column ${c.name || i + 1}`, c.expression)))];
        case 'pick': {
            if (t.fields.length === 0) return ['Add at least one field to keep.'];
            const missing = t.fields.some((f) => !f.source.trim()) ? ['Choose the field of every row.'] : [];
            const renamed = t.fields.filter((f) => f.alias?.trim()).map((f) => f.alias ?? '');
            const output = t.fields.map((f) => (f.alias?.trim() || f.source.split('.').pop() || '').trim()).filter(Boolean);
            const duplicate = output.find((name, i) => output.indexOf(name) !== i);
            return [...missing, ...nameIssues('Renamed field', renamed), ...(duplicate ? [`More than one field is named "${duplicate}".`] : [])];
        }
        case 'sort':
            if (t.keys.length === 0) return ['Add at least one sort key.'];
            return compact(t.keys.map((k, i) => expressionIssue(`Sort key ${i + 1}`, k.expression)));
        case 'group': {
            if (t.keys.length === 0 && t.aggregates.length === 0) return ['Add a group key or an aggregate.'];
            const names = [...t.keys.map((k) => k.name), ...t.aggregates.map((a) => a.name), ...(t.rowsField?.trim() ? [t.rowsField] : [])];
            return [
                ...nameIssues('Output field', names),
                ...compact(t.keys.map((k, i) => expressionIssue(`Group key ${k.name || i + 1}`, k.expression))),
                ...compact(t.aggregates.map((a, i) => expressionIssue(`Aggregate ${a.name || i + 1}`, a.expression, a.fn !== 'count'))),
            ];
        }
        case 'join': {
            const issues: string[] = [];
            if (!t.datasourceId) issues.push('Choose the datasource to join with.');
            if (t.on.length === 0) issues.push('Add at least one matching condition.');
            if (t.on.some((c) => !c.left.trim() || !c.right.trim())) issues.push('Choose both fields of every matching condition.');
            if (t.mode === 'nest' && !identifierPattern.test(t.nestAs?.trim() ?? '')) issues.push('Enter a valid name for the field holding the matched rows.');
            if (t.prefix?.trim() && !identifierPattern.test(t.prefix.trim())) issues.push('The prefix may only contain letters, digits and underscores.');
            return issues;
        }
        case 'union': {
            const issues: string[] = [];
            if (t.datasourceIds.filter(Boolean).length === 0) issues.push('Choose at least one datasource to append.');
            if (t.sourceField?.trim() && !identifierPattern.test(t.sourceField.trim())) issues.push(`"${t.sourceField}" is not a valid field name.`);
            return issues;
        }
        case 'flatten': {
            const issues: string[] = [];
            if (!t.childField.trim()) issues.push('Choose the list field to expand.');
            if (t.childPrefix?.trim() && !identifierPattern.test(t.childPrefix.trim())) issues.push('The prefix may only contain letters, digits and underscores.');
            return issues;
        }
        case 'distinct':
            return t.fields.some((f) => !f.trim()) ? ['Choose every distinct field, or remove the empty ones.'] : [];
        case 'limit': {
            const issues: string[] = [];
            if (t.offset !== undefined && (!Number.isInteger(t.offset) || t.offset < 0)) issues.push('Rows to skip must be a whole number of 0 or more.');
            if (t.count !== undefined && (!Number.isInteger(t.count) || t.count < 0)) issues.push('Rows to keep must be a whole number of 0 or more.');
            return issues;
        }
        case 'pivot': {
            const issues: string[] = [];
            if (t.rowFields.filter((f) => f.trim()).length === 0) issues.push('Choose at least one row field.');
            if (!t.columnField.trim()) issues.push('Choose the field whose values become columns.');
            if (t.aggregation !== 'count' && !t.valueField?.trim()) issues.push('Choose the field to aggregate.');
            if (t.columnPrefix?.trim() && !identifierPattern.test(t.columnPrefix.trim())) issues.push('The column prefix may only contain letters, digits and underscores.');
            return issues;
        }
        case 'unpivot': {
            const issues: string[] = [];
            if (t.fields.filter((f) => f.trim()).length === 0) issues.push('Choose the fields to turn into rows.');
            issues.push(...nameIssues('Output field', [t.nameField, t.valueField]));
            return issues;
        }
        case 'window': {
            if (t.columns.length === 0) return ['Add at least one column.'];
            return [
                ...nameIssues('Column', t.columns.map((c) => c.name)),
                ...t.columns.filter((c) => windowFunctionsWithField.includes(c.fn) && !c.field?.trim()).map((c) => `Choose the field of column ${c.name || c.fn}.`),
                ...compact(t.orderBy.map((k, i) => expressionIssue(`Order key ${i + 1}`, k.expression))),
                ...(t.partitionBy.some((f) => !f.trim()) ? ['Choose every partition field, or remove the empty ones.'] : []),
            ];
        }
        default:
            return [];
    }
}
