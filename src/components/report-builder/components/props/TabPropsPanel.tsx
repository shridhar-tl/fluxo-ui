import React, { useCallback } from 'react';
import { PlusIcon, TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { TextInput } from '../../../TextInput';
import { useReportBuilderContext } from '../../report-builder-context';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type { TabComponentProps, ReportComponent } from '../../report-definition-types';

interface Props { component: ReportComponent; }

export const TabPropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const p = component.props as unknown as TabComponentProps;
    const tabs = p.tabs ?? [];

    const updateTabs = useCallback((newTabs: TabComponentProps['tabs']) => {
        store.setState((prev: ReportBuilderState) => {
            const updatedComponents = updateComponentInTree(prev.definition.components, component.id, (c) => {
                const existingPanels = c.children ?? [];
                const newChildren = newTabs.map((tab) => {
                    const existing = existingPanels.find((p) => p.props.tabId === tab.id);
                    return existing ?? { id: crypto.randomUUID(), type: 'tab-panel', props: { tabId: tab.id }, styles: {}, children: [] };
                });
                return {
                    ...c,
                    props: { ...c.props, tabs: newTabs },
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

    const addTab = useCallback(() => {
        const newId = crypto.randomUUID();
        updateTabs([...tabs, { id: newId, label: `Tab ${tabs.length + 1}` }]);
    }, [tabs, updateTabs]);

    const renameTab = useCallback((id: string, label: string) => {
        updateTabs(tabs.map((t) => (t.id === id ? { ...t, label } : t)));
    }, [tabs, updateTabs]);

    const removeTab = useCallback((id: string) => {
        if (tabs.length <= 1) return;
        updateTabs(tabs.filter((t) => t.id !== id));
    }, [tabs, updateTabs]);

    return (
        <div className="eui-rb-props-section">
            <div className="eui-rb-props-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Tabs
                <Button
                    layout="plain"
                    size="xs"
                    onClick={addTab}
                    title="Add tab"
                    ariaLabel="Add tab"
                    leftIcon={<PlusIcon aria-hidden="true" />}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tabs.map((tab, i) => (
                    <div key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)', minWidth: 14 }}>{i + 1}.</span>
                        <TextInput
                            value={tab.label}
                            onChange={(e) => renameTab(tab.id, e.value)}
                            size="sm"
                            style={{ flex: 1 }}
                            aria-label={`Tab ${i + 1} label`}
                        />
                        <Button
                            layout="plain"
                            size="xs"
                            onClick={() => removeTab(tab.id)}
                            disabled={tabs.length <= 1}
                            title="Remove tab"
                            ariaLabel={`Remove tab ${tab.label}`}
                            leftIcon={<TrashIcon aria-hidden="true" />}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
