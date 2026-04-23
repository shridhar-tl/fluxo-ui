import React, { useCallback } from 'react';
import { Dropdown } from '../../../Dropdown';
import { NumericInput } from '../../../NumericInput';
import type { ListItem } from '../../../../types';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { HorizontalLineComponentProps, ReportComponent } from '../../report-definition-types';
import { ExpressionField } from './ExpressionField';

interface Props { component: ReportComponent; }

const styleOptions: ListItem[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
];

export const HorizontalLinePropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const p = component.props as unknown as HorizontalLineComponentProps;

    const update = useCallback((patch: Partial<HorizontalLineComponentProps>) => {
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

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title">Horizontal Line</div>

            <ExpressionField
                label="Label (optional)"
                value={String(p.label ?? '')}
                onChange={(v) => update({ label: v || undefined })}
                placeholder="Optional text shown inline with the rule"
                expectedReturnType="string"
            />

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Thickness (px)</label>
                <NumericInput
                    value={p.thickness ?? 1}
                    min={1}
                    max={20}
                    onChange={(e) => update({ thickness: e.value })}
                    aria-label="Line thickness"
                    size="sm"
                />
            </div>

            <ExpressionField
                label="Color"
                value={String(p.color ?? '')}
                onChange={(v) => update({ color: v || undefined })}
                placeholder="var(--eui-border-subtle)"
                expectedReturnType="string"
                inputType="color"
            />

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Style</label>
                <Dropdown
                    options={styleOptions}
                    value={p.style ?? 'solid'}
                    onChange={(e) => update({ style: e.value as HorizontalLineComponentProps['style'] })}
                    size="sm"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Top Margin (px)</label>
                    <NumericInput
                        value={p.marginTop ?? 8}
                        min={0}
                        onChange={(e) => update({ marginTop: e.value })}
                        aria-label="Top margin"
                        size="sm"
                    />
                </div>
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Bottom Margin (px)</label>
                    <NumericInput
                        value={p.marginBottom ?? 8}
                        min={0}
                        onChange={(e) => update({ marginBottom: e.value })}
                        aria-label="Bottom margin"
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
};
