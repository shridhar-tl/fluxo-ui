import React, { useCallback } from 'react';
import { NumericInput } from '../../../NumericInput';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { CanvasItemLayout, ReportComponent } from '../../report-definition-types';

const defaultLayout: CanvasItemLayout = { x: 0, y: 0, width: 200, height: 100 };

interface Props {
    item: ReportComponent;
}

/** Position and size of a component placed on a canvas, shown under the component's own properties. */
export const CanvasItemPositionPanel: React.FC<Props> = ({ item }) => {
    const { store } = useReportBuilderContext();
    const layout = (item.props.canvasLayout as CanvasItemLayout | undefined) ?? defaultLayout;

    const updateLayout = useCallback(
        (patch: Partial<CanvasItemLayout>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    components: updateComponentInTree(prev.definition.components, item.id, (c) => ({
                        ...c,
                        props: { ...c.props, canvasLayout: { ...((c.props.canvasLayout as CanvasItemLayout) ?? defaultLayout), ...patch } },
                    })),
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            }));
        },
        [store, item.id],
    );

    return (
        <div className="eui-rb-props-section" style={{ borderTop: '1px solid var(--eui-border-subtle)', paddingTop: 8, marginTop: 8 }}>
            <div className="eui-rb-props-section-title">Position on the canvas</div>
            <div className="eui-rb-prop-hint">In pixels from the top left corner of the canvas. You can also drag the item on the canvas.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">X</label>
                    <NumericInput value={layout.x} onChange={(e) => updateLayout({ x: e.value ?? 0 })} min={0} aria-label="X position" size="sm" />
                </div>
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Y</label>
                    <NumericInput value={layout.y} onChange={(e) => updateLayout({ y: e.value ?? 0 })} min={0} aria-label="Y position" size="sm" />
                </div>
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Width</label>
                    <NumericInput value={layout.width} onChange={(e) => updateLayout({ width: Math.max(60, e.value ?? 60) })} min={60} aria-label="Item width" size="sm" />
                </div>
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Height</label>
                    <NumericInput value={layout.height} onChange={(e) => updateLayout({ height: Math.max(40, e.value ?? 40) })} min={40} aria-label="Item height" size="sm" />
                </div>
            </div>
        </div>
    );
};
