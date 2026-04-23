import React, { useCallback, useMemo } from 'react';
import { Checkbox } from '../../../Checkbox';
import { Dropdown } from '../../../Dropdown';
import type { ListItem } from '../../../../types';
import { useReportBuilderContext, useRBStore } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type {
    RepeaterComponentProps,
    ReportComponent,
    VariableConfig,
} from '../../report-definition-types';
import { ComponentVariablesEditor } from './ComponentVariablesEditor';
import { ExpressionField } from './ExpressionField';

interface Props { component: ReportComponent; }

const layoutOptions: ListItem[] = [
    { value: 'stack', label: 'Stack (vertical)' },
    { value: 'grid', label: 'Grid' },
    { value: 'inline', label: 'Inline (horizontal)' },
];

const sortDirectionOptions: ListItem[] = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
];

const separatorOptions: ListItem[] = [
    { value: 'none', label: 'None' },
    { value: 'line', label: 'Line' },
    { value: 'gap', label: 'Extra gap' },
];

export const RepeaterPropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const datasources = useRBStore((s) => s.definition.datasources, true);
    const p = component.props as unknown as RepeaterComponentProps;

    const update = useCallback((patch: Partial<RepeaterComponentProps>) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: updateComponentInTree(prev.definition.components, component.id, (c) => ({
                    ...c,
                    props: { ...c.props, ...patch },
                })),
                metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
            },
        }));
    }, [store, component.id]);

    const handleVariablesChange = useCallback((variables: VariableConfig[]) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: updateComponentInTree(prev.definition.components, component.id, (c) => ({
                    ...c,
                    variables: variables.length > 0 ? variables : undefined,
                })),
                metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
            },
        }));
    }, [store, component.id]);

    const datasourceOptions: ListItem[] = useMemo(
        () => [
            { value: '', label: '— None (use expression) —' },
            ...datasources.map((ds) => ({ value: ds.id, label: ds.name })),
        ],
        [datasources],
    );

    const useExpressionDataset = !p.datasourceId;
    const layout = p.layout ?? 'stack';

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title">Repeater</div>

            <p style={{ fontSize: 11, color: 'var(--eui-text-muted)', marginTop: 0 }}>
                Renders its children once for each row of the bound dataset. Inside children, reference
                the current row with <code>Field.&lt;name&gt;</code>.
            </p>

            <div className="eui-rb-props-section-title" style={{ marginTop: 10 }}>Data binding</div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Datasource</label>
                <Dropdown
                    options={datasourceOptions}
                    value={p.datasourceId ?? ''}
                    onChange={(e) => update({ datasourceId: e.value || undefined })}
                    aria-label="Datasource to iterate over"
                    size="sm"
                />
            </div>

            {useExpressionDataset && (
                <ExpressionField
                    label="Dataset expression"
                    value={String(p.datasetExpression ?? '')}
                    onChange={(v) => update({ datasetExpression: v || undefined })}
                    placeholder="=Datasources.Items or =Filter(Datasources.Orders, 'total > 100')"
                    expectedReturnType="any"
                    multiline={true}
                    hint="Must return an array of rows."
                />
            )}

            <ExpressionField
                label="Filter (per-row)"
                value={String(p.filter ?? '')}
                onChange={(v) => update({ filter: v || undefined })}
                placeholder="=Field.active == true"
                expectedReturnType="boolean"
                hint="Row is skipped when the expression is falsy."
            />

            <ExpressionField
                label="Sort by"
                value={String(p.sortBy ?? '')}
                onChange={(v) => update({ sortBy: v || undefined })}
                placeholder="=Field.createdAt"
                expectedReturnType="any"
                hint="Comparable value per row."
            />

            {p.sortBy && (
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Sort direction</label>
                    <Dropdown
                        options={sortDirectionOptions}
                        value={p.sortDirection ?? 'asc'}
                        onChange={(e) => update({ sortDirection: e.value as 'asc' | 'desc' })}
                        aria-label="Sort direction"
                        size="sm"
                    />
                </div>
            )}

            <ExpressionField
                label="Offset"
                value={typeof p.offset === 'number' ? String(p.offset) : String(p.offset ?? '')}
                onChange={(v) => {
                    if (v === '') { update({ offset: undefined }); return; }
                    if (v.startsWith('=')) { update({ offset: v }); return; }
                    const n = parseInt(v, 10);
                    update({ offset: Number.isFinite(n) && n > 0 ? n : undefined });
                }}
                placeholder="0"
                expectedReturnType="number"
                inputType="number"
                min={0}
                hint="Number or =expression."
            />

            <ExpressionField
                label="Limit"
                value={typeof p.limit === 'number' ? String(p.limit) : String(p.limit ?? '')}
                onChange={(v) => {
                    if (v === '') { update({ limit: undefined }); return; }
                    if (v.startsWith('=')) { update({ limit: v }); return; }
                    const n = parseInt(v, 10);
                    update({ limit: Number.isFinite(n) && n > 0 ? n : undefined });
                }}
                placeholder="0 = no limit"
                expectedReturnType="number"
                inputType="number"
                min={0}
                hint="Number or =expression. 0 means no limit."
            />


            <div className="eui-rb-props-section-title" style={{ marginTop: 12 }}>Layout</div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Direction</label>
                <Dropdown
                    options={layoutOptions}
                    value={layout}
                    onChange={(e) => update({ layout: e.value as RepeaterComponentProps['layout'] })}
                    aria-label="Layout direction"
                    size="sm"
                />
            </div>

            {layout === 'grid' && (
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Grid columns</label>
                    <input
                        type="number"
                        min={1}
                        max={12}
                        value={p.gridColumns ?? 2}
                        onChange={(e) => {
                            const n = parseInt(e.target.value, 10);
                            update({ gridColumns: Number.isFinite(n) && n >= 1 ? Math.min(12, n) : 2 });
                        }}
                        className="eui-rb-prop-input"
                    />
                </div>
            )}

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Gap (px)</label>
                <input
                    type="number"
                    min={0}
                    value={p.gap ?? 8}
                    onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        update({ gap: Number.isFinite(n) && n >= 0 ? n : 0 });
                    }}
                    className="eui-rb-prop-input"
                />
            </div>

            {layout === 'inline' && (
                <Checkbox
                    label="Wrap when overflowing"
                    checked={p.inlineWrap ?? true}
                    onChange={(e) => update({ inlineWrap: e.value })}
                />
            )}

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Separator</label>
                <Dropdown
                    options={separatorOptions}
                    value={p.separator ?? 'none'}
                    onChange={(e) => update({ separator: e.value as RepeaterComponentProps['separator'] })}
                    aria-label="Separator between iterations"
                    size="sm"
                />
            </div>

            <Checkbox
                label="Alternate row background"
                checked={p.alternateRowBackground ?? false}
                onChange={(e) => update({ alternateRowBackground: e.value })}
            />

            <div className="eui-rb-props-section-title" style={{ marginTop: 12 }}>Empty state</div>

            <ExpressionField
                label="Empty message"
                value={String(p.emptyMessage ?? '')}
                onChange={(v) => update({ emptyMessage: v || undefined })}
                placeholder="No items to display."
                expectedReturnType="string"
                hint="Shown when the dataset is empty or all rows are filtered out."
            />

            <Checkbox
                label="Hide entire repeater when empty"
                checked={p.hideWhenEmpty ?? false}
                onChange={(e) => update({ hideWhenEmpty: e.value })}
            />

            <ComponentVariablesEditor
                title="Component Variables"
                description="Variables declared here are scoped to the repeater and each iteration. Iteration metadata is also available as Variables.iterationIndex, iterationCount, isFirst, isLast, isEven, isOdd."
                variables={component.variables}
                onChange={handleVariablesChange}
            />
        </div>
    );
};
