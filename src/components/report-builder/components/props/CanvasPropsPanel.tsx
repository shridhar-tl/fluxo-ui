import React, { useCallback } from 'react';
import { Checkbox } from '../../../Checkbox';
import { TextInput } from '../../../TextInput';
import { NumericInput } from '../../../NumericInput';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { ReportComponent, CanvasComponentProps } from '../../report-definition-types';

interface Props { component: ReportComponent; }

export const CanvasPropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const p = component.props as unknown as CanvasComponentProps;
    const children = component.children ?? [];

    const update = useCallback((patch: Partial<CanvasComponentProps>) => {
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
            <div className="eui-rb-props-section-title">Canvas</div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Width</label>
                <TextInput
                    value={p.width ?? '100%'}
                    onChange={(e) => update({ width: e.value || undefined })}
                    placeholder="100% or 800px"
                    aria-label="Canvas width"
                    size="sm"
                />
            </div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Height</label>
                <TextInput
                    value={p.height ?? '400px'}
                    onChange={(e) => update({ height: e.value || undefined })}
                    placeholder="400px"
                    aria-label="Canvas height"
                    size="sm"
                />
            </div>

            <div className="eui-rb-prop-field">
                <Checkbox
                    checked={p.snapToGrid ?? false}
                    onChange={(e) => update({ snapToGrid: e.value })}
                    label="Snap to grid"
                />
            </div>

            {(p.snapToGrid ?? false) && (
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Grid Size (px)</label>
                    <NumericInput
                        value={p.gridSize ?? 10}
                        onChange={(e) => update({ gridSize: Math.max(5, e.value ?? 10) })}
                        min={5}
                        max={100}
                        aria-label="Grid size"
                        size="sm"
                    />
                </div>
            )}

            <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', padding: '8px 0 4px' }}>
                {children.length} item{children.length !== 1 ? 's' : ''} placed
            </div>

        </div>
    );
};
