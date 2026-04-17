import React, { useCallback } from 'react';
import { NumericInput } from '../../../NumericInput';
import { TextInput } from '../../../TextInput';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { HorizontalLineComponentProps, ReportComponent } from '../../report-definition-types';

interface Props { component: ReportComponent; }

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

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Color</label>
                <div style={{ display: 'flex', gap: 6 }}>
                    <input
                        type="color"
                        value={p.color || '#cccccc'}
                        onChange={(e) => update({ color: e.target.value })}
                        style={{ width: 32, height: 28, border: '1px solid var(--eui-border-subtle)', borderRadius: 3, cursor: 'pointer', padding: 1, background: 'var(--eui-input-bg)' }}
                        aria-label="Line color picker"
                    />
                    <TextInput
                        value={p.color ?? ''}
                        onChange={(e) => update({ color: e.value })}
                        placeholder="var(--eui-border-subtle)"
                        size="sm"
                        style={{ flex: 1 }}
                        aria-label="Line color"
                    />
                </div>
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
