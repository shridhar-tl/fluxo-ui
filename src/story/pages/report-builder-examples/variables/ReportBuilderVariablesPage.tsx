import React, { useMemo } from 'react';
import PageLayout from '../../../PageLayout';
import type { SectionNavItem } from '../../../SectionNav';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildComponentScopedDefinition } from './definitions/component-scoped-definition';
import { buildGlobalVariablesDefinition } from './definitions/global-variables-definition';
import { buildSetVariableActionDefinition } from './definitions/set-variable-action-definition';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'What variables are' },
    { id: 'global', title: 'Global + drill', description: 'Drill-through writes + conditional visibility' },
    { id: 'component-scope', title: 'Component scope', description: 'Isolated per-component buckets' },
    { id: 'set-variable', title: 'Set-variable actions', description: 'Buttons that flip a mode' },
    { id: 'notes', title: 'Notes', description: 'Rules and gotchas' },
];

const globalHighlights: ExpressionHighlight[] = [
    {
        label: 'Drill-through target',
        expression: "onDrillThrough: 'selectedOrder'",
        explanation:
            'Set on the Table props. When a row is clicked, the whole row object is written into Variables.selectedOrder (and the host onDrillThrough callback fires as a notification).',
    },
    {
        label: 'Visibility gate',
        expression: '=!IsEmpty(Variables.selectedOrder)',
        explanation:
            'On the detail panel&rsquo;s styles.visible. The panel is hidden until the variable has a value. IsEmpty also treats empty strings / arrays as empty.',
    },
    {
        label: 'Reading a drill-written row',
        expression:
            "=Concat('Selected: ', Variables.selectedOrder.id, ' · ', Variables.selectedOrder.region, ' · ', Variables.selectedOrder.product, ' → ', FormatCurrency(Variables.selectedOrder.revenue, '$', 0))",
        explanation:
            'Because drill writes the full row, you read specific fields with dot paths. No separate onDrill event is needed — the state is already in the expression context.',
    },
];

const componentHighlights: ExpressionHighlight[] = [
    {
        label: 'Component-scoped declaration',
        expression: "variables: [{ name: 'localSelection', scope: 'component' }]",
        explanation:
            'Declared directly on the component, not on the report. The scope walker writes to the nearest enclosing declaration; siblings get independent buckets.',
    },
    {
        label: 'Independent drills',
        expression: "onDrillThrough: 'localSelection' (on both tables)",
        explanation:
            'Same variable name, two different buckets. Selecting a row in Table A does not write into Table B&rsquo;s bucket — the scope chain never crosses.',
    },
];

const setVariableHighlights: ExpressionHighlight[] = [
    {
        label: 'Cell-item set-variable action',
        expression: "clickAction: 'set-variable', setVariableName: 'viewMode', setVariableValueExpr: \"'revenue'\"",
        explanation:
            "The cell item writes a literal string into Variables.viewMode. Use `'set-variable'` for buttons / pills; use `'drill'` when the value is a row from the current dataset.",
    },
    {
        label: 'Switch() aggregate',
        expression:
            "=Switch(Variables.viewMode, 'revenue', FormatCurrency(Sum(Datasources.orders, 'revenue'), '$', 0), 'units', Sum(Datasources.orders, 'units'), 'cost', FormatCurrency(Sum(Datasources.orders, 'cost'), '$', 0), '')",
        explanation:
            'The footer cell&rsquo;s textExpression reads the variable and picks the right aggregate. Switch is terser than nested IIfs for three+ branches.',
    },
];

const ReportBuilderVariablesPage: React.FC = () => {
    const globalDef = useMemo(() => buildGlobalVariablesDefinition(), []);
    const componentDef = useMemo(() => buildComponentScopedDefinition(), []);
    const setVariableDef = useMemo(() => buildSetVariableActionDefinition(), []);

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Variables &amp; Conditional Visibility
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-3">
                    Variables are the in-report writable state. They answer the question &quot;which row did the user just
                    click?&quot; — the viewer mutates them; expressions read them. Crucially, <em>nothing inside the viewer
                    mutates parameters</em>. Drills, cell clicks, chart clicks all write to variables. Parameters only
                    change via the parameter panel&rsquo;s Apply button.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    A variable has a <code>scope</code>: <strong>global</strong> variables live on the report and are
                    writable from anywhere; <strong>component</strong> variables are declared on a specific component
                    and are only writable from within that component&rsquo;s subtree. Outside the subtree, reads fall
                    through to the global bucket with the same name (or <code>null</code>).
                </p>
            </div>

            <section id="global" className="scroll-mt-8">
                <LiveExampleViewer
                    title="1 · Global variable + drill-through → conditional visibility"
                    description="The classic pattern. Clicking a row writes the row into a global variable; a downstream component reads it and toggles visibility."
                    definition={globalDef}
                    highlights={globalHighlights}
                    height={540}
                />
            </section>

            <section id="component-scope" className="scroll-mt-8">
                <LiveExampleViewer
                    title="2 · Component-scoped variables"
                    description="Two tables, same variable name, independent buckets. Click a row in one — the other is unaffected."
                    definition={componentDef}
                    highlights={componentHighlights}
                    height={640}
                />
            </section>

            <section id="set-variable" className="scroll-mt-8">
                <LiveExampleViewer
                    title="3 · Set-variable cell action (buttons / pills)"
                    description="Cell items can set a variable to an arbitrary expression value. Use this for view-mode toggles or anything that is not a row selection."
                    definition={setVariableDef}
                    highlights={setVariableHighlights}
                    height={520}
                />
            </section>

            <section id="notes" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                    Notes
                </h2>
                <ul
                    style={{
                        color: 'var(--eui-text-muted)',
                        fontSize: 13,
                        lineHeight: 1.6,
                        paddingLeft: 20,
                        listStyleType: 'disc',
                    }}
                >
                    <li>
                        <strong>Drill writes the whole row.</strong> If you only need one field, use a cell-item
                        <code> drill</code> action with <code>drillValueExpr</code>, or just read the path
                        (<code>Variables.selectedOrder.id</code>) downstream.
                    </li>
                    <li>
                        <strong>Scope resolution is bottom-up.</strong> A cell action writes to the nearest enclosing
                        component that declares the variable name. If no component declares it, it falls back to the
                        global bucket.
                    </li>
                    <li>
                        <strong>Default values are expressions.</strong>{' '}
                        <code>defaultValueExpression: &quot;=Today()&quot;</code> seeds the variable on first render;
                        explicit writes override it thereafter.
                    </li>
                    <li>
                        <strong>Host visibility.</strong>{' '}
                        <code>onDrillThrough(variableName, value)</code> still fires as a pure notification — use it if
                        the host app needs to react (analytics, navigation) in addition to the in-report variable write.
                    </li>
                </ul>
            </section>
        </PageLayout>
    );
};

export default ReportBuilderVariablesPage;
