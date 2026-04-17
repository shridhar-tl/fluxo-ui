import React, { useCallback } from 'react';
import { Checkbox } from '../../../Checkbox';
import { TextInput } from '../../../TextInput';
import { NumericInput } from '../../../NumericInput';
import { useReportBuilderContext, useRBStore } from '../../report-builder-context';
import { updateComponentInTree, findComponent } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { ReportComponent, CanvasComponentProps, CanvasItemLayout } from '../../report-definition-types';

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

    const selectedId = useRBStore((s) => s.selectedItemId);
    const selectedChild = selectedId ? findComponent(children, selectedId) : null;
    const selectedLayout = selectedChild
        ? (selectedChild.props.canvasLayout as CanvasItemLayout | undefined) ?? { x: 0, y: 0, width: 200, height: 100 }
        : null;

    const updateChildLayout = useCallback((childId: string, layout: Partial<CanvasItemLayout>) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: updateComponentInTree(prev.definition.components, childId, (c) => ({
                    ...c,
                    props: {
                        ...c.props,
                        canvasLayout: {
                            ...((c.props.canvasLayout as CanvasItemLayout) ?? { x: 0, y: 0, width: 200, height: 100 }),
                            ...layout,
                        },
                    },
                })),
                metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
            },
        }));
    }, [store]);

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

            {selectedChild && selectedLayout && (
                <div style={{ borderTop: '1px solid var(--eui-border-subtle)', paddingTop: 8, marginTop: 4 }}>
                    <div className="eui-rb-props-section-title">Selected Item Position</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div className="eui-rb-prop-field">
                            <label className="eui-rb-prop-field-label">X</label>
                            <NumericInput
                                value={selectedLayout.x}
                                onChange={(e) => updateChildLayout(selectedChild.id, { x: e.value ?? 0 })}
                                min={0}
                                aria-label="X position"
                                size="sm"
                            />
                        </div>
                        <div className="eui-rb-prop-field">
                            <label className="eui-rb-prop-field-label">Y</label>
                            <NumericInput
                                value={selectedLayout.y}
                                onChange={(e) => updateChildLayout(selectedChild.id, { y: e.value ?? 0 })}
                                min={0}
                                aria-label="Y position"
                                size="sm"
                            />
                        </div>
                        <div className="eui-rb-prop-field">
                            <label className="eui-rb-prop-field-label">Width</label>
                            <NumericInput
                                value={selectedLayout.width}
                                onChange={(e) => updateChildLayout(selectedChild.id, { width: Math.max(60, e.value ?? 60) })}
                                min={60}
                                aria-label="Item width"
                                size="sm"
                            />
                        </div>
                        <div className="eui-rb-prop-field">
                            <label className="eui-rb-prop-field-label">Height</label>
                            <NumericInput
                                value={selectedLayout.height}
                                onChange={(e) => updateChildLayout(selectedChild.id, { height: Math.max(40, e.value ?? 40) })}
                                min={40}
                                aria-label="Item height"
                                size="sm"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
