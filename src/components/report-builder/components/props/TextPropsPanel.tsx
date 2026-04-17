import React, { useCallback } from 'react';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { TextComponentProps, ReportComponent } from '../../report-definition-types';
import { ExpressionField } from './ExpressionField';

interface Props { component: ReportComponent; }

export const TextPropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const p = component.props as unknown as TextComponentProps;

    const update = useCallback((patch: Partial<TextComponentProps>) => {
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
            <div className="eui-rb-props-section-title">Text</div>
            <ExpressionField
                label="Content"
                value={String(p.content ?? '')}
                onChange={(v) => update({ content: v })}
                placeholder="Enter text or use Datasources.name.field for field binding"
                expectedReturnType="string"
                multiline
            />
            <p style={{ fontSize: 11, color: 'var(--eui-text-muted)', marginTop: 4 }}>
                Use <code>Datasources.name.field</code> to bind a field value inline.
            </p>
        </div>
    );
};
