import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    DatabaseIcon,
    DownloadIcon,
    FilterIcon,
    PaletteIcon,
    PlayIcon,
    PrintIcon,
    RedoIcon,
    RefreshIcon,
    SaveIcon,
    SettingsIcon,
    TerminalIcon,
    TimesIcon,
    TrashIcon,
    UndoIcon,
    WrenchIcon,
} from '../../assets/icons';
import { DockedLayout } from '../docked-layout';
import type { DockedLayoutState, PanelConfig, ContentTab } from '../docked-layout';
import DragDropProvider from '../drag-drop/DragDropProvider';
import { ReportBuilderContext, useRBStore } from './report-builder-context';
import { ReportViewer } from './ReportViewer';
import { createReportBuilderStore } from './report-builder-store';
import type { ReportBuilderProps, ReportBuilderState, ReportViewerHandle } from './report-builder-types';
import { createEmptyDefinition } from './report-definition-types';
import { ConsolePanel } from './components/ConsolePanel';
import { DatasourceExplorer } from './components/DatasourceExplorer';
import { ParametersListPanel } from './components/ParametersListPanel';
import { PropertiesPallet } from './components/PropertiesPallet';
import { StylesPallet } from './components/StylesPallet';
import { ToolboxPanel } from './components/ToolboxPanel';
import { DesignArea } from './DesignArea';
import './report-builder.scss';

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
    definition: externalDefinition,
    onChange,
    datasourcePlugins = [],
    parameterPlugins = [],
    availableSubReports = [],
    breakpoints: propBreakpoints,
    panelConfig,
    layoutState: externalLayoutState,
    onLayoutChange,
    templates = [],
    onSaveTemplate,
    onDeleteTemplate,
    onLoadTemplate,
    enableMultiTab = false,
    tabs,
    activeTabId: externalActiveTabId,
    onTabChange,
    onTabClose,
    className,
    style,
}) => {
    const singleStore = useMemo(
        () => {
            const initial: ReportBuilderState = {
                definition: externalDefinition ?? createEmptyDefinition(),
                selectedItemId: null,
                selectedItemType: 'none',
            };
            return createReportBuilderStore(initial);
        },
        [],
    );

    const tabStoresRef = useRef<Map<string, ReturnType<typeof createReportBuilderStore>>>(new Map());
    const tabUnsubsRef = useRef<Map<string, () => void>>(new Map());

    const getOrCreateTabStore = useCallback((tabId: string, definition: import('./report-definition-types').ReportDefinition) => {
        let s = tabStoresRef.current.get(tabId);
        if (!s) {
            s = createReportBuilderStore({
                definition,
                selectedItemId: null,
                selectedItemType: 'none',
            });
            tabStoresRef.current.set(tabId, s);
        }
        return s;
    }, []);

    useEffect(() => {
        if (!enableMultiTab || !tabs) return;
        for (const tab of tabs) {
            const s = getOrCreateTabStore(tab.id, tab.definition);
            if (!tabUnsubsRef.current.has(tab.id)) {
                const unsub = s.on('change', (newState: ReportBuilderState) => {
                    onChange?.(newState.definition);
                });
                tabUnsubsRef.current.set(tab.id, unsub);
            }
        }
        const tabIds = new Set(tabs.map((t) => t.id));
        for (const [id, unsub] of tabUnsubsRef.current) {
            if (!tabIds.has(id)) {
                unsub();
                tabUnsubsRef.current.delete(id);
                tabStoresRef.current.delete(id);
            }
        }
    }, [enableMultiTab, tabs, getOrCreateTabStore, onChange]);

    useEffect(() => {
        return () => {
            for (const unsub of tabUnsubsRef.current.values()) unsub();
            tabUnsubsRef.current.clear();
            tabStoresRef.current.clear();
        };
    }, []);

    const activeTabStore = useMemo(() => {
        if (!enableMultiTab || !tabs || !externalActiveTabId) return null;
        const tab = tabs.find((t) => t.id === externalActiveTabId);
        if (!tab) return null;
        return getOrCreateTabStore(tab.id, tab.definition);
    }, [enableMultiTab, tabs, externalActiveTabId, getOrCreateTabStore]);

    const store = activeTabStore ?? singleStore;

    const [layoutState, setLayoutState] = useState<DockedLayoutState | undefined>(externalLayoutState);
    const [previewing, setPreviewing] = useState(false);
    const viewerHandleRef = useRef<ReportViewerHandle>(null);
    const internalChangeRef = useRef(false);

    useEffect(() => {
        if (!enableMultiTab && externalDefinition && !internalChangeRef.current) {
            singleStore.setState((prev: ReportBuilderState) => {
                if (prev.definition === externalDefinition) return prev;
                return { ...prev, definition: externalDefinition };
            });
        }
        internalChangeRef.current = false;
    }, [externalDefinition, singleStore, enableMultiTab]);

    useEffect(() => {
        if (enableMultiTab) return;
        const unsub = singleStore.on('change', (newState: ReportBuilderState) => {
            internalChangeRef.current = true;
            onChange?.(newState.definition);
        });
        return unsub;
    }, [singleStore, onChange, enableMultiTab]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
            if (isInput) return;
            const isMeta = e.ctrlKey || e.metaKey;
            if (!isMeta) return;
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (store.canUndo) store.undo();
            } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                e.preventDefault();
                if (store.canRedo) store.redo();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [store]);

    const handleLayoutChange = useCallback(
        (state: DockedLayoutState) => {
            setLayoutState(state);
            onLayoutChange?.(state);
        },
        [onLayoutChange],
    );

    const toolboxPc = panelConfig?.toolbox;
    const datasourcePc = panelConfig?.datasource;
    const parametersPc = panelConfig?.parameters;
    const propertiesPc = panelConfig?.properties;
    const stylesPc = panelConfig?.styles;
    const consolePc = panelConfig?.console;

    const panels: PanelConfig[] = useMemo(() => [
        {
            id: 'rb-toolbox',
            title: 'Toolbox',
            icon: WrenchIcon,
            defaultPosition: 'left',
            defaultState: 'pinned',
            defaultSize: 220,
            minSize: 160,
            userCanMove: toolboxPc?.userCanMove,
            userCanClose: toolboxPc?.userCanClose,
            userCanTogglePin: true,
            children: <ToolboxPanel />,
            breakpoints: propBreakpoints ? [
                { breakpointKey: 'xs', state: 'auto-hide' },
                { breakpointKey: 'sm', state: 'auto-hide' },
            ] : undefined,
        },
        {
            id: 'rb-datasource',
            title: 'Datasource Explorer',
            icon: DatabaseIcon,
            defaultPosition: 'left',
            defaultState: 'pinned',
            defaultSize: 220,
            minSize: 160,
            userCanMove: datasourcePc?.userCanMove,
            userCanClose: datasourcePc?.userCanClose,
            userCanTogglePin: true,
            children: <DatasourceExplorer />,
            breakpoints: propBreakpoints ? [
                { breakpointKey: 'xs', state: 'auto-hide' },
                { breakpointKey: 'sm', state: 'auto-hide' },
            ] : undefined,
        },
        {
            id: 'rb-parameters',
            title: 'Parameters',
            icon: FilterIcon,
            defaultPosition: 'left',
            defaultState: 'auto-hide',
            defaultSize: 220,
            minSize: 160,
            userCanMove: parametersPc?.userCanMove,
            userCanClose: parametersPc?.userCanClose,
            userCanTogglePin: true,
            children: <ParametersListPanel />,
            breakpoints: propBreakpoints ? [
                { breakpointKey: 'xs', state: 'auto-hide' },
                { breakpointKey: 'sm', state: 'auto-hide' },
            ] : undefined,
        },
        {
            id: 'rb-properties',
            title: 'Properties',
            icon: SettingsIcon,
            defaultPosition: 'right',
            defaultState: 'pinned',
            defaultSize: 260,
            minSize: 200,
            userCanMove: propertiesPc?.userCanMove,
            userCanClose: propertiesPc?.userCanClose,
            userCanTogglePin: true,
            children: <PropertiesPallet />,
            breakpoints: propBreakpoints ? [
                { breakpointKey: 'xs', state: 'auto-hide' },
                { breakpointKey: 'sm', state: 'auto-hide' },
            ] : undefined,
        },
        {
            id: 'rb-styles',
            title: 'Styles',
            icon: PaletteIcon,
            defaultPosition: 'right',
            defaultState: 'pinned',
            defaultSize: 260,
            minSize: 200,
            userCanMove: stylesPc?.userCanMove,
            userCanClose: stylesPc?.userCanClose,
            userCanTogglePin: true,
            children: <StylesPallet />,
        },
        {
            id: 'rb-console',
            title: 'Console',
            icon: TerminalIcon,
            defaultPosition: 'bottom',
            defaultState: 'auto-hide',
            defaultSize: 160,
            minSize: 80,
            userCanMove: consolePc?.userCanMove,
            userCanClose: consolePc?.userCanClose,
            userCanTogglePin: true,
            children: <ConsolePanel />,
        },
    ], [toolboxPc, datasourcePc, parametersPc, propertiesPc, stylesPc, consolePc, propBreakpoints]);

    const contextValue = useMemo(
        () => ({ store, datasourcePlugins, parameterPlugins, availableSubReports, templates, onSaveTemplate, onDeleteTemplate, onLoadTemplate }),
        [store, datasourcePlugins, parameterPlugins, availableSubReports, templates, onSaveTemplate, onDeleteTemplate, onLoadTemplate],
    );

    const previewDefinition = store.getState().definition;

    return (
        <ReportBuilderContext.Provider value={contextValue}>
            <DragDropProvider>
            <div className={classNames('eui-report-builder', className)} style={style}>
                <ReportBuilderToolbar previewing={previewing} onTogglePreview={() => setPreviewing((v) => !v)} viewerHandleRef={viewerHandleRef} />

                <div className="eui-report-builder-layout">
                    {previewing ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <ReportViewer
                                definition={previewDefinition}
                                datasourcePlugins={datasourcePlugins}
                                hideToolbar
                                viewerRef={viewerHandleRef}
                                style={{ flex: 1 }}
                            />
                        </div>
                    ) : (
                        <DockedLayout
                            panels={panels}
                            layoutState={externalLayoutState ?? layoutState}
                            onChange={handleLayoutChange}
                            tabMode="icon-label"
                            breakpoints={propBreakpoints}
                            enableContentTabs={enableMultiTab && !!tabs && tabs.length > 0}
                            contentTabs={enableMultiTab && tabs ? tabs.map((t): ContentTab => ({
                                id: t.id,
                                label: t.label,
                                closable: true,
                                content: <TabDesignArea tabId={t.id} getOrCreateTabStore={getOrCreateTabStore} definition={t.definition} />,
                            })) : undefined}
                            activeContentTabId={externalActiveTabId}
                            onContentTabChange={onTabChange}
                            onContentTabClose={onTabClose}
                        >
                            <DesignArea />
                        </DockedLayout>
                    )}
                </div>
            </div>
            </DragDropProvider>
        </ReportBuilderContext.Provider>
    );
};

ReportBuilder.displayName = 'ReportBuilder';

const TabDesignArea: React.FC<{
    tabId: string;
    getOrCreateTabStore: (tabId: string, definition: import('./report-definition-types').ReportDefinition) => ReturnType<typeof createReportBuilderStore>;
    definition: import('./report-definition-types').ReportDefinition;
}> = ({ tabId, getOrCreateTabStore, definition }) => {
    const parentCtx = React.useContext(ReportBuilderContext)!;
    const tabStore = useMemo(() => getOrCreateTabStore(tabId, definition), [tabId, getOrCreateTabStore, definition]);

    const tabCtx = useMemo(() => ({
        ...parentCtx,
        store: tabStore,
    }), [parentCtx, tabStore]);

    return (
        <ReportBuilderContext.Provider value={tabCtx}>
            <DesignArea />
        </ReportBuilderContext.Provider>
    );
};

const ReportBuilderToolbar: React.FC<{ previewing: boolean; onTogglePreview: () => void; viewerHandleRef: React.RefObject<ReportViewerHandle | null> }> = ({ previewing, onTogglePreview, viewerHandleRef }) => {
    const ctx = React.useContext(ReportBuilderContext)!;
    const { store, templates, onSaveTemplate, onDeleteTemplate, onLoadTemplate } = ctx;
    const title = useRBStore((s) => s.definition.metadata.title);
    const [undoRedo, setUndoRedo] = useState({ canUndo: store.canUndo, canRedo: store.canRedo });
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const templateMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsub = store.on('change', () => {
            setUndoRedo({ canUndo: store.canUndo, canRedo: store.canRedo });
        });
        return unsub;
    }, [store]);

    useEffect(() => {
        if (!showTemplateMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
                setShowTemplateMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTemplateMenu]);

    const selectSettings = useCallback(() => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            selectedItemId: null,
            selectedItemType: 'report-settings',
        }));
    }, [store]);

    const handleSaveTemplate = useCallback(() => {
        if (!onSaveTemplate) return;
        const def = store.getState().definition;
        const template = {
            id: crypto.randomUUID(),
            name: def.metadata.title || 'Untitled Template',
            definition: def,
            createdAt: new Date().toISOString(),
        };
        onSaveTemplate(template);
    }, [store, onSaveTemplate]);

    const handleLoadTemplate = useCallback((tmpl: import('./report-builder-types').ReportTemplate) => {
        if (onLoadTemplate) {
            onLoadTemplate(tmpl);
        } else {
            const def = { ...tmpl.definition, id: crypto.randomUUID(), metadata: { ...tmpl.definition.metadata, updatedAt: new Date().toISOString() } };
            store.setState((prev: ReportBuilderState) => ({ ...prev, definition: def }));
        }
        setShowTemplateMenu(false);
    }, [store, onLoadTemplate]);

    const handleDeleteTemplate = useCallback((e: React.MouseEvent, templateId: string) => {
        e.stopPropagation();
        onDeleteTemplate?.(templateId);
    }, [onDeleteTemplate]);

    const [templateFilter, setTemplateFilter] = useState('');

    const filteredTemplates = useMemo(() => {
        if (!templateFilter) return templates;
        const lower = templateFilter.toLowerCase();
        return templates.filter((t) =>
            t.name.toLowerCase().includes(lower) ||
            t.category?.toLowerCase().includes(lower) ||
            t.tags?.some((tag) => tag.toLowerCase().includes(lower)),
        );
    }, [templates, templateFilter]);

    const groupedTemplates = useMemo(() => {
        const groups = new Map<string, typeof templates>();
        for (const tmpl of filteredTemplates) {
            const cat = tmpl.category || '';
            const arr = groups.get(cat);
            if (arr) arr.push(tmpl);
            else groups.set(cat, [tmpl]);
        }
        return groups;
    }, [filteredTemplates]);

    return (
        <div className="eui-report-builder-toolbar" role="toolbar" aria-label="Report Builder Toolbar">
            <span className="eui-report-builder-toolbar-title" title={title}>{title}</span>
            <div className="eui-report-builder-toolbar-divider" />
            <button
                className="eui-report-builder-tool-btn"
                onClick={() => store.undo()}
                disabled={!undoRedo.canUndo}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
            >
                <UndoIcon aria-hidden="true" />
                Undo
            </button>
            <button
                className="eui-report-builder-tool-btn"
                onClick={() => store.redo()}
                disabled={!undoRedo.canRedo}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
            >
                <RedoIcon aria-hidden="true" />
                Redo
            </button>
            <div className="eui-report-builder-toolbar-divider" />
            <button
                className="eui-report-builder-tool-btn"
                onClick={selectSettings}
                title="Report Settings"
                aria-label="Report Settings"
            >
                <SettingsIcon aria-hidden="true" />
                Settings
            </button>
            <div className="eui-report-builder-toolbar-divider" />
            <button
                className={classNames('eui-report-builder-tool-btn', { active: previewing })}
                onClick={onTogglePreview}
                title={previewing ? 'Back to Design' : 'Preview Report'}
                aria-label={previewing ? 'Back to Design' : 'Preview Report'}
                aria-pressed={previewing}
            >
                {previewing ? <TimesIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
                {previewing ? 'Close Preview' : 'Preview'}
            </button>
            {previewing && (
                <>
                    <button
                        className="eui-report-builder-tool-btn"
                        onClick={() => viewerHandleRef.current?.print()}
                        title="Print"
                        aria-label="Print report"
                    >
                        <PrintIcon aria-hidden="true" />
                        Print
                    </button>
                    <button
                        className="eui-report-builder-tool-btn"
                        onClick={() => viewerHandleRef.current?.exportPdf()}
                        title="Export PDF"
                        aria-label="Export report as PDF"
                    >
                        <DownloadIcon aria-hidden="true" />
                        PDF
                    </button>
                    <button
                        className="eui-report-builder-tool-btn"
                        onClick={() => viewerHandleRef.current?.refresh()}
                        title="Reload"
                        aria-label="Reload report"
                    >
                        <RefreshIcon aria-hidden="true" />
                        Reload
                    </button>
                </>
            )}
            {(onSaveTemplate || templates.length > 0) && (
                <>
                    <div className="eui-report-builder-toolbar-divider" />
                    {onSaveTemplate && (
                        <button
                            className="eui-report-builder-tool-btn"
                            onClick={handleSaveTemplate}
                            title="Save as Template"
                            aria-label="Save as Template"
                        >
                            <SaveIcon aria-hidden="true" />
                            Save Template
                        </button>
                    )}
                    {templates.length > 0 && (
                        <div style={{ position: 'relative' }} ref={templateMenuRef}>
                            <button
                                className="eui-report-builder-tool-btn"
                                onClick={() => setShowTemplateMenu((v) => !v)}
                                title="Load from Template"
                                aria-label="Load from Template"
                                aria-expanded={showTemplateMenu}
                                aria-haspopup="listbox"
                            >
                                <DownloadIcon aria-hidden="true" />
                                Templates
                            </button>
                            {showTemplateMenu && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        minWidth: 260,
                                        background: 'var(--eui-bg)',
                                        border: '1px solid var(--eui-border-subtle)',
                                        borderRadius: 6,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        zIndex: 100,
                                        maxHeight: 400,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    role="listbox"
                                    aria-label="Templates"
                                >
                                    {templates.length > 5 && (
                                        <div style={{ padding: '8px 8px 4px', borderBottom: '1px solid var(--eui-border-subtle)', flexShrink: 0 }}>
                                            <input
                                                type="text"
                                                value={templateFilter}
                                                onChange={(e) => setTemplateFilter(e.target.value)}
                                                placeholder="Search templates..."
                                                style={{
                                                    width: '100%',
                                                    height: 28,
                                                    padding: '0 8px',
                                                    border: '1px solid var(--eui-border-subtle)',
                                                    borderRadius: 4,
                                                    background: 'var(--eui-input-bg)',
                                                    color: 'var(--eui-text)',
                                                    fontSize: 12,
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                }}
                                                aria-label="Search templates"
                                            />
                                        </div>
                                    )}
                                    <div style={{ overflowY: 'auto', flex: 1 }}>
                                        {Array.from(groupedTemplates.entries()).map(([category, tmpls]) => (
                                            <div key={category}>
                                                {category && (
                                                    <div style={{
                                                        padding: '6px 12px 2px',
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.06em',
                                                        color: 'var(--eui-text-muted)',
                                                    }}>
                                                        {category}
                                                    </div>
                                                )}
                                                {tmpls.map((tmpl) => (
                                                    <div
                                                        key={tmpl.id}
                                                        role="option"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: 6,
                                                            padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            color: 'var(--eui-text)',
                                                            fontSize: 12,
                                                        }}
                                                        onClick={() => handleLoadTemplate(tmpl)}
                                                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--eui-bg-subtle)'; }}
                                                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                                                    >
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontWeight: 500 }}>{tmpl.name}</div>
                                                            {tmpl.description && (
                                                                <div style={{ fontSize: 10, color: 'var(--eui-text-muted)', marginTop: 2 }}>{tmpl.description}</div>
                                                            )}
                                                            {tmpl.tags && tmpl.tags.length > 0 && (
                                                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                                                                    {tmpl.tags.map((tag) => (
                                                                        <span key={tag} style={{
                                                                            fontSize: 9,
                                                                            padding: '1px 5px',
                                                                            borderRadius: 3,
                                                                            background: 'var(--eui-primary-soft)',
                                                                            color: 'var(--eui-primary)',
                                                                            fontWeight: 500,
                                                                        }}>
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {onDeleteTemplate && (
                                                            <button
                                                                onClick={(e) => handleDeleteTemplate(e, tmpl.id)}
                                                                title="Delete template"
                                                                aria-label={`Delete template ${tmpl.name}`}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: 22,
                                                                    height: 22,
                                                                    border: 'none',
                                                                    background: 'transparent',
                                                                    color: 'var(--eui-text-muted)',
                                                                    borderRadius: 3,
                                                                    cursor: 'pointer',
                                                                    padding: 0,
                                                                    flexShrink: 0,
                                                                    marginTop: 1,
                                                                }}
                                                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                                                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--eui-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                                            >
                                                                <TrashIcon style={{ width: 12, height: 12 }} aria-hidden="true" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                        {filteredTemplates.length === 0 && (
                                            <div style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--eui-text-muted)', fontSize: 11 }}>
                                                No templates match your search.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
