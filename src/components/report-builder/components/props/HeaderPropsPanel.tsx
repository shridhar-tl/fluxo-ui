import React, { useCallback } from 'react';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { HeaderComponentProps, ReportComponent, VariableConfig } from '../../report-definition-types';
import { ComponentVariablesEditor } from './ComponentVariablesEditor';
import { ExpressionField } from './ExpressionField';

interface Props { component: ReportComponent; }

const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

export const HeaderPropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const p = component.props as unknown as HeaderComponentProps;

    const update = useCallback((patch: Partial<HeaderComponentProps>) => {
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
            <div className="eui-rb-props-section-title">Header</div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Level</label>
                <div className="eui-rb-prop-level-grid">
                    {levels.map((lvl) => (
                        <button
                            key={lvl}
                            className={`eui-rb-prop-level-btn${p.level === lvl ? ' active' : ''}`}
                            onClick={() => update({ level: lvl })}
                            aria-pressed={p.level === lvl}
                        >
                            {lvl.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <ExpressionField
                label="Content"
                value={String(p.content ?? '')}
                onChange={(v) => update({ content: v })}
                placeholder="Enter heading text or =expression"
                expectedReturnType="string"
                multiline={false}
            />

            <ExpressionField
                label="Tooltip"
                value={String(p.tooltip ?? '')}
                onChange={(v) => update({ tooltip: v || undefined })}
                placeholder="Optional hover text"
                expectedReturnType="string"
            />

            <ExpressionField
                label="Anchor ID"
                value={String(p.anchorId ?? '')}
                onChange={(v) => update({ anchorId: v || undefined })}
                placeholder="Optional — enables linking to this heading"
                expectedReturnType="string"
                hint="Rendered as the HTML id attribute, so # links work."
            />

            <ComponentVariablesEditor
                title="Component Variables"
                description="Variables declared here are scoped to this header and its descendants."
                variables={component.variables}
                onChange={handleVariablesChange}
            />
        </div>
    );
};
