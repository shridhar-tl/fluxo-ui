import React, { useCallback } from 'react';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { HeaderComponentProps, ReportComponent } from '../../report-definition-types';
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
        </div>
    );
};
