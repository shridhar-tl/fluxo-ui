import React, { useCallback } from 'react';
import { Dropdown } from '../../../Dropdown';
import { TextInput } from '../../../TextInput';
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
                placeholder="https://... or =expression"
                expectedReturnType="string"
            />

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Alt Text</label>
                <TextInput
                    value={p.alt ?? ''}
                    onChange={(e) => update({ alt: e.value })}
                    placeholder="Describe the image"
                    aria-label="Alt text"
                    size="sm"
                />
            </div>

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
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Width</label>
                    <TextInput
                        value={p.width ?? '100%'}
                        onChange={(e) => update({ width: e.value })}
                        placeholder="100% or 200px"
                        aria-label="Width"
                        size="sm"
                    />
                </div>
                <div className="eui-rb-prop-field">
                    <label className="eui-rb-prop-field-label">Height</label>
                    <TextInput
                        value={p.height ?? 'auto'}
                        onChange={(e) => update({ height: e.value })}
                        placeholder="auto or 200px"
                        aria-label="Height"
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
};
