import React, { useCallback } from 'react';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { ColumnsComponentProps, ReportComponent } from '../../report-definition-types';

interface Props { component: ReportComponent; }

export const ColumnsPropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const p = component.props as unknown as ColumnsComponentProps;

    const setColumnCount = useCallback((count: number) => {
        store.setState((prev: ReportBuilderState) => {
            const updatedComponents = updateComponentInTree(prev.definition.components, component.id, (c) => {
                const existing = c.children ?? [];
                let newChildren = [...existing];
                while (newChildren.length < count) {
                    newChildren.push({ id: crypto.randomUUID(), type: 'column', props: {}, styles: {}, children: [] });
                }
                if (newChildren.length > count) {
                    newChildren = newChildren.slice(0, count);
                }
                return {
                    ...c,
                    props: { ...c.props, columnCount: count },
                    children: newChildren,
                };
            });
            return {
                ...prev,
                definition: {
                    ...prev.definition,
                    components: updatedComponents,
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            };
        });
    }, [store, component.id]);

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title">Columns Layout</div>

            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label">Number of Columns</label>
                <div className="eui-rb-prop-level-grid">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <button
                            key={n}
                            className={`eui-rb-prop-level-btn${(p.columnCount ?? 2) === n ? ' active' : ''}`}
                            onClick={() => setColumnCount(n)}
                            aria-pressed={(p.columnCount ?? 2) === n}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            <p style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>
                Drop components into each column in the design area.
            </p>
        </div>
    );
};
