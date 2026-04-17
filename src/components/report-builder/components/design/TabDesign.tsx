import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { isDragAllowedInContainer } from '../../report-component-helpers';
import type { ReportComponent, TabComponentProps } from '../../report-definition-types';
import { NestedDesignComponent } from './NestedDesignComponent';

interface TabDesignProps {
    component: ReportComponent;
    onContainerDrop: (e: React.DragEvent, containerId: string, insertIndex: number) => void;
    selectedId: string | null;
    onSelectNested: (id: string) => void;
    onDeleteNested: (id: string) => void;
    onDuplicateNested: (id: string) => void;
}

export const TabDesign: React.FC<TabDesignProps> = ({
    component,
    onContainerDrop,
    selectedId,
    onSelectNested,
    onDeleteNested,
    onDuplicateNested,
}) => {
    const p = component.props as unknown as TabComponentProps;
    const tabs = p.tabs ?? [];
    const [activeTabId, setActiveTabId] = useState<string>(p.defaultTabId ?? tabs[0]?.id ?? '');

    const panels = component.children ?? [];
    const activePanel = panels.find((panel) => panel.props.tabId === activeTabId);

    return (
        <div className="eui-rb-tab-design">
            <div className="eui-rb-tab-design-tabs" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={classNames('eui-rb-tab-design-tab', { active: tab.id === activeTabId })}
                        role="tab"
                        aria-selected={tab.id === activeTabId}
                        onClick={(e) => { e.stopPropagation(); setActiveTabId(tab.id); }}
                    >
                        {tab.label || 'Untitled Tab'}
                    </button>
                ))}
            </div>
            <div className="eui-rb-tab-design-panel" role="tabpanel">
                {activePanel && (
                    <TabPanelDropZone
                        panel={activePanel}
                        onContainerDrop={onContainerDrop}
                        selectedId={selectedId}
                        onSelectNested={onSelectNested}
                        onDeleteNested={onDeleteNested}
                        onDuplicateNested={onDuplicateNested}
                    />
                )}
            </div>
        </div>
    );
};

interface TabPanelDropZoneProps {
    panel: ReportComponent;
    onContainerDrop: (e: React.DragEvent, containerId: string, insertIndex: number) => void;
    selectedId: string | null;
    onSelectNested: (id: string) => void;
    onDeleteNested: (id: string) => void;
    onDuplicateNested: (id: string) => void;
}

const TabPanelDropZone: React.FC<TabPanelDropZoneProps> = ({
    panel,
    onContainerDrop,
    selectedId,
    onSelectNested,
    onDeleteNested,
    onDuplicateNested,
}) => {
    const [dragOver, setDragOver] = useState(false);
    const children = panel.children ?? [];

    const handleDragOver = useCallback((e: React.DragEvent) => {
        const hasNew = e.dataTransfer.types.includes('application/rb-component-type');
        const hasMove = e.dataTransfer.types.includes('application/rb-component-move-nested');
        if ((hasNew || hasMove) && isDragAllowedInContainer(e.dataTransfer.types, 'tab-panel')) {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(true);
        }
    }, []);

    return (
        <div
            className={classNames('eui-rb-tab-panel-drop', { 'drag-over': dragOver })}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { setDragOver(false); onContainerDrop(e, panel.id, children.length); }}
        >
            {children.length === 0 ? (
                <div className="eui-rb-col-empty">Drop components here</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {children.map((child, i) => (
                        <NestedDesignComponent
                            key={child.id}
                            component={child}
                            index={i}
                            containerId={panel.id}
                            selected={selectedId === child.id}
                            onSelect={onSelectNested}
                            onDelete={onDeleteNested}
                            onDuplicate={onDuplicateNested}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
