import React, { useMemo } from 'react';
import PageLayout from '../../../PageLayout';
import type { SectionNavItem } from '../../../SectionNav';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildDatasetBoundDefinition } from './definitions/dataset-bound-definition';
import { buildSelectionTypesDefinition } from './definitions/selection-types-definition';
import { buildSimpleTypesDefinition } from './definitions/simple-types-definition';
import { buildValidationDefinition } from './definitions/validation-definition';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Parameter model' },
    { id: 'simple-types', title: 'Simple types', description: 'Text, numeric, date, date-range' },
    { id: 'selection-types', title: 'Selection types', description: 'Dropdown, radio, multi-select, chips' },
    { id: 'validation', title: 'Validation', description: 'Rules and apply-gate' },
    { id: 'dataset-bound', title: 'Dataset-bound', description: 'Options from a datasource' },
    { id: 'apply-flow', title: 'Apply-on-click flow', description: 'Why edits stay local' },
];

const simpleHighlights: ExpressionHighlight[] = [
    {
        label: 'Multi-condition rowVisibleExpr with IsEmpty guards',
        expression:
            "(IsEmpty(Parameters.orderId) || Contains(Field.id, Parameters.orderId)) && (IsEmpty(Parameters.minUnits) || Field.units >= Parameters.minUnits)",
        explanation:
            'The `IsEmpty(param) || <clause>` idiom is critical: without it a blank numeric parameter evaluates to NaN >= NaN → false → zero rows. Always guard optional clauses this way.',
    },
    {
        label: 'Date range nested path',
        expression:
            "IsEmpty(Parameters.dateRange) || IsEmpty(Parameters.dateRange.start) || (Field.orderDate >= Parameters.dateRange.start && Field.orderDate <= Parameters.dateRange.end)",
        explanation:
            'date-range-picker writes an object { start, end }. Guard both the container and the start field — either can be undefined before the user picks a range.',
    },
];

const selectionHighlights: ExpressionHighlight[] = [
    {
        label: 'Array parameter → InList',
        expression: 'IsEmpty(Parameters.categories) || InList(Field.category, Parameters.categories)',
        explanation:
            'multi-select and chips return arrays. InList(value, array) is the combinator — it handles loose equality like ==.',
    },
    {
        label: 'Checkbox as a gate',
        expression: "!Parameters.onlyActive || Field.status != 'cancelled'",
        explanation:
            'Checkbox defaults to false; use !param to make "unchecked" act as no filter, and the !param branch short-circuits.',
    },
];

const validationHighlights: ExpressionHighlight[] = [
    {
        label: 'Declarative regex validation',
        expression: "validation: { regex: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', regexMessage: 'Enter a valid email' }",
        explanation:
            'Validation rules live on the parameter config — the parameter panel enforces them and disables Apply until they pass. No imperative callback.',
    },
    {
        label: 'Case-insensitive contains',
        expression: 'Contains(Lower(Field.name), Lower(Parameters.employeeName))',
        explanation:
            'Contains is case-sensitive. Wrapping both sides with Lower() is the usual pattern for a case-insensitive text filter.',
    },
];

const datasetBoundHighlights: ExpressionHighlight[] = [
    {
        label: 'Parameter options from a datasource',
        expression: "datasetId: 'ds-regions', displayField: 'label', valueField: 'value'",
        explanation:
            'Set these on the parameter (NOT inside typeConfig). The viewer reads the named datasource and projects rows into ListItem-shaped options on every fetch.',
    },
    {
        label: 'Autocomplete minQueryLength',
        expression: 'typeConfig: { minQueryLength: 0 }',
        explanation:
            'minQueryLength=0 means the dropdown opens even without typing. Raise it to 2 when the option list is large (hundreds of entries).',
    },
];

const ReportBuilderParametersPage: React.FC = () => {
    const simpleDef = useMemo(() => buildSimpleTypesDefinition(), []);
    const selectionDef = useMemo(() => buildSelectionTypesDefinition(), []);
    const validationDef = useMemo(() => buildValidationDefinition(), []);
    const datasetBoundDef = useMemo(() => buildDatasetBoundDefinition(), []);

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 style={{ color: 'var(--eui-text)' }} className="text-2xl md:text-4xl font-bold mb-4">
                    Parameters
                </h1>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-base md:text-lg mb-3">
                    Parameters are host-owned inputs. The host passes them in via{' '}
                    <code>parameterValues</code>; the user edits them in the parameter panel and confirms with Apply.
                    Nothing inside the viewer writes to parameters — drills / clicks go to Variables instead.
                </p>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    Each section below is a live report. Toggle the parameter panel via the Settings icon in the viewer
                    toolbar, enter values, and press Apply to refresh.
                </p>
            </div>

            <section id="simple-types" className="scroll-mt-8">
                <LiveExampleViewer
                    title="1 · Simple types (text, numeric, date, date-range)"
                    description="The text, numeric, date-picker, and date-range-picker parameter types combined into a multi-clause rowVisibleExpr."
                    definition={simpleDef}
                    highlights={simpleHighlights}
                    height={540}
                />
            </section>

            <section id="selection-types" className="scroll-mt-8">
                <LiveExampleViewer
                    title="2 · Selection types (dropdown, radio, multi-select, chips, checkbox)"
                    description="Single-value and multi-value selection types. Note the chips type accepting free text in addition to its suggestions."
                    definition={selectionDef}
                    highlights={selectionHighlights}
                    height={580}
                />
            </section>

            <section id="validation" className="scroll-mt-8">
                <LiveExampleViewer
                    title="3 · Validation rules"
                    description="Declarative rules: mandatory, regex + regexMessage, min/max value, min/max length, min/max items, allowedFileTypes."
                    definition={validationDef}
                    highlights={validationHighlights}
                    height={560}
                />
            </section>

            <section id="dataset-bound" className="scroll-mt-8">
                <LiveExampleViewer
                    title="4 · Dataset-bound options"
                    description="A dropdown and an autocomplete each draw their options from a datasource. Ideal for long lists that live server-side."
                    definition={datasetBoundDef}
                    highlights={datasetBoundHighlights}
                    height={520}
                />
            </section>

            <section id="apply-flow" className="scroll-mt-8">
                <h2 style={{ color: 'var(--eui-text)' }} className="text-2xl font-semibold mb-3">
                    Apply-on-click flow
                </h2>
                <p style={{ color: 'var(--eui-text-muted)' }} className="text-sm mb-3">
                    The parameter panel buffers edits locally until the user presses Apply. That one-shot commit is on
                    purpose:
                </p>
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
                        <strong>Single datasource refetch per user intent.</strong> Every parameter flows into every
                        datasource plugin&rsquo;s <code>fetch(config, parameters)</code>. Applying once avoids hammering
                        the plugin on every keystroke of a free-text filter.
                    </li>
                    <li>
                        <strong>URL hash stays stable.</strong> When <code>syncParamsToHash</code> is on, the hash
                        updates only on Apply, so a shared link exactly reproduces what the user intended.
                    </li>
                    <li>
                        <strong>Validation runs before commit.</strong> Apply is disabled until every mandatory / regex
                        / min-max rule passes — no intermediate invalid state leaks into <code>parameterValues</code>.
                    </li>
                    <li>
                        <strong>
                            <code>onParameterChange</code>
                        </strong>{' '}
                        fires on Apply, not on keystroke. The host-visible state is always valid.
                    </li>
                </ul>
            </section>
        </PageLayout>
    );
};

export default ReportBuilderParametersPage;
