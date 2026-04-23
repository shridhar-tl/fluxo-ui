import React, { useCallback } from 'react';
import { Checkbox } from '../../../Checkbox';
import { Dropdown } from '../../../Dropdown';
import type { ListItem } from '../../../../types';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { ImageComponentProps, ReportComponent } from '../../report-definition-types';
import { ExpressionField } from './ExpressionField';

interface Props { component: ReportComponent; }

const objectFitOptions: ListItem[] = [
    { value: 'contain', label: 'Contain' },
    { value: 'cover', label: 'Cover' },
    { value: 'fill', label: 'Fill' },
    { value: 'none', label: 'None' },
    { value: 'scale-down', label: 'Scale Down' },
];

export const ImagePropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const p = component.props as unknown as ImageComponentProps;

    const update = useCallback((patch: Partial<ImageComponentProps>) => {
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
            <div className="eui-rb-props-section-title">Image</div>

            <ExpressionField
                label="Source URL"
                value={String(p.src ?? '')}
                onChange={(v) => update({ src: v })}
                placeholder="https://... or toggle fx for an expression"
                expectedReturnType="string"
                hint="Allowed schemes: https, http, data:image/*, relative paths."
            />

            <ExpressionField
                label="Alt Text"
                value={String(p.alt ?? '')}
                onChange={(v) => update({ alt: v || undefined })}
                placeholder="Describe the image"
                expectedReturnType="string"
            />

            <ExpressionField
                label="Tooltip"
                value={String(p.tooltip ?? '')}
                onChange={(v) => update({ tooltip: v || undefined })}
                placeholder="Optional hover text"
                expectedReturnType="string"
            />

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Object Fit</label>
                <Dropdown
                    options={objectFitOptions}
                    value={p.objectFit ?? 'contain'}
                    onChange={(e) => update({ objectFit: e.value as ImageComponentProps['objectFit'] })}
                    aria-label="Object fit"
                    size="sm"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <ExpressionField
                    label="Width"
                    value={String(p.width ?? '100%')}
                    onChange={(v) => update({ width: v })}
                    placeholder="100% or 200px"
                    expectedReturnType="string"
                />
                <ExpressionField
                    label="Height"
                    value={String(p.height ?? 'auto')}
                    onChange={(v) => update({ height: v })}
                    placeholder="auto or 200px"
                    expectedReturnType="string"
                />
            </div>

            <ExpressionField
                label="Click URL (optional)"
                value={String(p.href ?? '')}
                onChange={(v) => update({ href: v || undefined })}
                placeholder="https://... to wrap the image in a link"
                expectedReturnType="string"
            />

            <div className="eui-rb-prop-field">
                <Checkbox
                    checked={p.openInNewTab === true}
                    onChange={(e) => update({ openInNewTab: e.value })}
                    label="Open link in new tab"
                />
            </div>
        </div>
    );
};
