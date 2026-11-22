import { getComponentTypeLabel } from './components/design/component-type-labels';
import { getDerivedDependencies } from './data/core-plugins';
import { validateExpression } from './expression/expression-parser';
import { getIdentifierError } from './identifier-validation';
import type { SelectedItemType } from './report-builder-types';
import type { DerivedDatasourceConfig, ReportComponent, ReportDefinition } from './report-definition-types';

export interface ReportProblem {
    level: 'error' | 'warn';
    message: string;
    itemType: Exclude<SelectedItemType, 'none' | 'report-settings'>;
    itemId: string;
}

const dataComponentTypes = new Set([
    'table',
    'chart-bar',
    'chart-horizontal-bar',
    'chart-stacked-bar',
    'chart-line',
    'chart-area',
    'chart-pie',
    'chart-donut',
    'chart-polar-area',
    'chart-radar',
    'chart-scatter',
    'chart-bubble',
]);

function walk(components: ReportComponent[], visit: (component: ReportComponent) => void): void {
    for (const component of components) {
        visit(component);
        if (component.children) walk(component.children, visit);
    }
}

function componentName(component: ReportComponent): string {
    return getComponentTypeLabel(component.type) ?? component.type;
}

const expressionKeyPattern = /(Expr|Expression|^expression)$/;
const shownExpressionLength = 60;

function collectExpressions(value: unknown, out: string[] = []): string[] {
    if (Array.isArray(value)) {
        value.forEach((item) => collectExpressions(item, out));
    } else if (value && typeof value === 'object') {
        for (const [key, item] of Object.entries(value)) {
            if (typeof item !== 'string') {
                collectExpressions(item, out);
                continue;
            }
            const text = item.trim();
            if (text.startsWith('=') && text.length > 1) out.push(text.slice(1));
            else if (text && expressionKeyPattern.test(key)) out.push(text);
        }
    }
    return out;
}

function expressionProblems(owner: string, value: unknown): string[] {
    return collectExpressions(value).flatMap((expression) => {
        const [error] = validateExpression(expression);
        if (!error) return [];
        const shown = expression.length > shownExpressionLength ? `${expression.slice(0, shownExpressionLength)}…` : expression;
        return [`${owner} has an expression that cannot run: ${error.message}. Expression: ${shown}`];
    });
}

/**
 * Problems that stop parts of the report from running or showing data: names that are not valid identifiers or
 * are used twice, components without the data they need, datasources derived from one that no longer exists, and expressions that cannot run.
 */
export function collectReportProblems(definition: ReportDefinition): ReportProblem[] {
    const problems: ReportProblem[] = [];
    const datasourceIds = new Set([...definition.datasources.map((d) => d.id), ...(definition.parentContext?.datasources.map((d) => d.id) ?? [])]);

    definition.datasources.forEach((ds, i) => {
        const others = definition.datasources.filter((_, j) => j !== i).map((d) => d.name);
        const nameError = getIdentifierError(ds.name, others, 'Datasources');
        if (nameError) problems.push({ level: 'error', message: `Datasource "${ds.name || '(no name)'}": ${nameError}`, itemType: 'datasource', itemId: ds.id });
        for (const message of expressionProblems(`Datasource "${ds.name}"`, ds.config)) {
            problems.push({ level: 'error', message, itemType: 'datasource', itemId: ds.id });
        }
        if (ds.type === 'derived') {
            const config = ds.config as unknown as DerivedDatasourceConfig;
            if (!config.sourceDatasourceId) {
                problems.push({ level: 'error', message: `Datasource "${ds.name}" has no source datasource.`, itemType: 'datasource', itemId: ds.id });
            } else if (getDerivedDependencies(config).some((id) => !datasourceIds.has(id))) {
                problems.push({ level: 'error', message: `Datasource "${ds.name}" uses a datasource that no longer exists.`, itemType: 'datasource', itemId: ds.id });
            }
        }
    });

    definition.parameters.forEach((p, i) => {
        const others = definition.parameters.filter((_, j) => j !== i).map((o) => o.name);
        const nameError = getIdentifierError(p.name, others, 'Parameters');
        if (nameError) problems.push({ level: 'error', message: `Parameter "${p.label || p.name}": ${nameError}`, itemType: 'parameter', itemId: p.id });
        for (const message of expressionProblems(`Parameter "${p.label || p.name}"`, p)) {
            problems.push({ level: 'error', message, itemType: 'parameter', itemId: p.id });
        }
        if (p.hidden && p.mandatory && (p.defaultValue === undefined || p.defaultValue === '')) {
            problems.push({
                level: 'warn',
                message: `Parameter "${p.label || p.name}" is hidden and mandatory but has no default value, so the report never runs.`,
                itemType: 'parameter',
                itemId: p.id,
            });
        }
    });

    definition.variables.forEach((v, i) => {
        const others = definition.variables.filter((_, j) => j !== i).map((o) => o.name);
        const nameError = getIdentifierError(v.name, others, 'Variables');
        if (nameError) problems.push({ level: 'error', message: `Variable "${v.name || '(no name)'}": ${nameError}`, itemType: 'variable', itemId: v.id });
        for (const message of expressionProblems(`Variable "${v.name}"`, v)) {
            problems.push({ level: 'error', message, itemType: 'variable', itemId: v.id });
        }
    });

    walk(definition.components, (component) => {
        const props = component.props as { datasourceId?: string; datasetExpression?: string; subReportId?: string };
        if (dataComponentTypes.has(component.type)) {
            if (!props.datasourceId) {
                problems.push({ level: 'warn', message: `${componentName(component)} has no datasource, so it shows no data.`, itemType: 'component', itemId: component.id });
            } else if (!datasourceIds.has(props.datasourceId)) {
                problems.push({ level: 'error', message: `${componentName(component)} uses a datasource that no longer exists.`, itemType: 'component', itemId: component.id });
            }
        }
        if (component.type === 'repeater' && !props.datasourceId && !props.datasetExpression?.trim()) {
            problems.push({ level: 'warn', message: 'Repeater has no datasource or dataset expression to repeat over.', itemType: 'component', itemId: component.id });
        }
        for (const message of expressionProblems(componentName(component), { props: component.props, variables: component.variables })) {
            problems.push({ level: 'error', message, itemType: 'component', itemId: component.id });
        }
        if (component.type === 'sub-report' && !props.subReportId) {
            problems.push({ level: 'warn', message: 'Sub-report has no report chosen to embed.', itemType: 'component', itemId: component.id });
        }
    });

    return problems;
}
