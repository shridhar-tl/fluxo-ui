import React, { useCallback } from 'react';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { TextComponentProps, ReportComponent, VariableConfig } from '../../report-definition-types';
import { ComponentVariablesEditor } from './ComponentVariablesEditor';
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

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title">Text</div>
            <ExpressionField
                label="Content"
                value={String(p.content ?? '')}
                onChange={(v) => update({ content: v })}
                placeholder="Enter text or switch fx to write an expression"
                expectedReturnType="string"
                multiline
                hint="Use Parameters.name, Variables.name, or Datasources.name.field in expressions."
            />

            <ExpressionField
                label="Tooltip"
                value={String(p.tooltip ?? '')}
                onChange={(v) => update({ tooltip: v || undefined })}
                placeholder="Optional hover text"
                expectedReturnType="string"
            />

            <ComponentVariablesEditor
                title="Component Variables"
                description="Variables declared here are scoped to this text component and its descendants."
                variables={component.variables}
                onChange={handleVariablesChange}
            />
        </div>
    );
};
