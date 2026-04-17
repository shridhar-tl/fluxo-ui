import React, { useCallback, useMemo } from 'react';
import { TimesIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { Dropdown } from '../../../Dropdown';
import { NumericInput } from '../../../NumericInput';
import { TextInput } from '../../../TextInput';
import type { ListItem } from '../../../../types';
import { useReportBuilderContext, useRBStore } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { ReportComponent, ChartComponentProps } from '../../report-definition-types';
import { ExpressionField } from './ExpressionField';

interface Props { component: ReportComponent; }

const defaultColors = [
    '#4f87f7', '#f76f6f', '#48c774', '#ffb347', '#a78bfa',
    '#f472b6', '#38bdf8', '#fb923c', '#34d399', '#e879f9',
];

export const ChartPropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const datasources = useRBStore((s) => s.definition.datasources);
    const p = component.props as unknown as ChartComponentProps;
    const isBar = component.type === 'chart-bar';
    const isLine = component.type === 'chart-line';
    const isPieOrDonut = component.type === 'chart-pie' || component.type === 'chart-donut';

    const update = useCallback((patch: Partial<ChartComponentProps>) => {
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

    const colors = p.colors ?? [];

    const handleAddColor = useCallback(() => {
        const nextColor = defaultColors[colors.length % defaultColors.length];
        update({ colors: [...colors, nextColor] });
    }, [update, colors]);

    const handleRemoveColor = useCallback((idx: number) => {
        update({ colors: colors.filter((_, i) => i !== idx) });
    }, [update, colors]);

    const handleColorChange = useCallback((idx: number, value: string) => {
        const next = [...colors];
        next[idx] = value;
        update({ colors: next });
    }, [update, colors]);

    const dsOptions: ListItem[] = useMemo(
        () => [
            { value: '', label: '— Select —' },
            ...datasources.map((ds) => ({ value: ds.id, label: ds.name })),
        ],
        [datasources],
    );

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title">
                {component.type === 'chart-bar' ? 'Bar Chart' : component.type === 'chart-line' ? 'Line Chart' : component.type === 'chart-pie' ? 'Pie Chart' : 'Donut Chart'}
            </div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Datasource</label>
                <Dropdown
                    options={dsOptions}
                    value={p.datasourceId ?? ''}
                    onChange={(e) => update({ datasourceId: e.value })}
                    aria-label="Select datasource"
                    size="sm"
                />
            </div>

            <ExpressionField
                label="Title"
                value={p.title ?? ''}
                onChange={(v) => update({ title: v })}
                placeholder="Chart title"
                expectedReturnType="string"
                multiline={false}
            />

            <div className="eui-rb-prop-field">
                <Checkbox
                    checked={p.showLegend ?? true}
                    onChange={(e) => update({ showLegend: e.value })}
                    label="Show legend"
                />
            </div>

            {isBar && (
                <>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">X-Axis Field</label>
                        <TextInput
                            value={p.xAxisField ?? ''}
                            onChange={(e) => update({ xAxisField: e.value })}
                            placeholder="Field name for labels"
                            aria-label="X-axis field"
                            size="sm"
                        />
                    </div>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Y-Axis Field</label>
                        <TextInput
                            value={p.yAxisField ?? ''}
                            onChange={(e) => update({ yAxisField: e.value })}
                            placeholder="Field name for values"
                            aria-label="Y-axis field"
                            size="sm"
                        />
                    </div>
                    <ExpressionField
                        label="Bar Color"
                        value={p.barColor ?? '#4f87f7'}
                        onChange={(v) => update({ barColor: v })}
                        placeholder="#4f87f7"
                        inputType="color"
                    />
                    <div className="eui-rb-prop-field">
                        <Checkbox
                            checked={p.stacked ?? false}
                            onChange={(e) => update({ stacked: e.value })}
                            label="Stacked bars"
                        />
                    </div>
                </>
            )}

            {isLine && (
                <>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">X-Axis Field</label>
                        <TextInput
                            value={p.xAxisField ?? ''}
                            onChange={(e) => update({ xAxisField: e.value })}
                            placeholder="Field name for labels"
                            aria-label="X-axis field"
                            size="sm"
                        />
                    </div>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Y-Axis Field</label>
                        <TextInput
                            value={p.yAxisField ?? ''}
                            onChange={(e) => update({ yAxisField: e.value })}
                            placeholder="Field name for values"
                            aria-label="Y-axis field"
                            size="sm"
                        />
                    </div>
                    <ExpressionField
                        label="Line Color"
                        value={p.lineColor ?? '#4f87f7'}
                        onChange={(v) => update({ lineColor: v })}
                        placeholder="#4f87f7"
                        inputType="color"
                    />
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Line Tension</label>
                        <NumericInput
                            value={p.lineTension ?? 0.3}
                            onChange={(e) => update({ lineTension: e.value })}
                            min={0}
                            max={1}
                            maxDecimals={2}
                            aria-label="Line tension"
                            size="sm"
                        />
                    </div>
                    <div className="eui-rb-prop-field">
                        <Checkbox
                            checked={p.showPoints ?? true}
                            onChange={(e) => update({ showPoints: e.value })}
                            label="Show data points"
                        />
                    </div>
                    <div className="eui-rb-prop-field">
                        <Checkbox
                            checked={p.areaFill ?? false}
                            onChange={(e) => update({ areaFill: e.value })}
                            label="Area fill"
                        />
                    </div>
                </>
            )}

            {isPieOrDonut && (
                <>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Label Field</label>
                        <TextInput
                            value={p.labelField ?? ''}
                            onChange={(e) => update({ labelField: e.value })}
                            placeholder="Field name for labels"
                            aria-label="Label field"
                            size="sm"
                        />
                    </div>
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Value Field</label>
                        <TextInput
                            value={p.valueField ?? ''}
                            onChange={(e) => update({ valueField: e.value })}
                            placeholder="Field name for values"
                            aria-label="Value field"
                            size="sm"
                        />
                    </div>

                    <div className="eui-rb-props-section-title" style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Colors ({colors.length})</span>
                        <Button
                            layout="outlined"
                            size="xs"
                            onClick={handleAddColor}
                            ariaLabel="Add color"
                            label="+ Add"
                        />
                    </div>

                    {colors.length === 0 && (
                        <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                            Default colors will be used.
                        </div>
                    )}

                    {colors.map((color, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => handleColorChange(idx, e.target.value)}
                                style={{ width: 28, height: 24, border: '1px solid var(--eui-border-subtle)', borderRadius: 3, cursor: 'pointer', padding: 1, background: 'var(--eui-input-bg)' }}
                                aria-label={`Color ${idx + 1}`}
                            />
                            <TextInput
                                value={color}
                                onChange={(e) => handleColorChange(idx, e.value)}
                                size="sm"
                                style={{ flex: 1 }}
                                aria-label={`Color ${idx + 1} hex`}
                            />
                            <Button
                                layout="plain"
                                size="xs"
                                onClick={() => handleRemoveColor(idx)}
                                title="Remove color"
                                ariaLabel={`Remove color ${idx + 1}`}
                                leftIcon={<TimesIcon aria-hidden="true" />}
                            />
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};
