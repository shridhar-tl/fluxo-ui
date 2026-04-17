import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { LayersIcon } from '../../assets/icons';
import { useRBStore } from './report-builder-context';
import { useReportBuilderContext } from './report-builder-context';
import { getPageDimensionsPx } from './report-definition-types';
import {
    createComponent,
    deleteComponentFromTree,
    duplicateComponent,
    findComponent,
    insertIntoContainer,
    isTypeAllowedInContainer,
    moveWithinContainer,
} from './report-component-helpers';
import { DesignComponent } from './components/design/DesignComponent';
import type { ReportBuilderState } from './report-builder-types';

interface DropZoneProps {
    active: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragLeave: () => void;
}

const DropZone: React.FC<DropZoneProps> = ({ active, onDragOver, onDrop, onDragLeave }) => (
    <div
        className={classNames('eui-rb-drop-zone', { active })}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
        aria-hidden="true"
    />
);

interface EmptyCanvasProps {
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

const EmptyCanvas: React.FC<EmptyCanvasProps> = ({ onDragOver, onDrop }) => (
    <div
        className="eui-rb-design-area-placeholder"
        onDragOver={onDragOver}
        onDrop={onDrop}
    >
        <LayersIcon aria-hidden="true" />
        <h3>Design Area</h3>
        <p>Drag components from the Toolbox to start building your report.</p>
    </div>
);

export const DesignArea: React.FC = () => {
    const { store } = useReportBuilderContext();
    const components = useRBStore((s) => s.definition.components);
    const selectedId = useRBStore((s) => s.selectedItemId);
    const pageSetup = useRBStore((s) => s.definition.globalStyles.pageSetup);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const pageDims = useMemo(() => getPageDimensionsPx(pageSetup), [pageSetup]);
    const marginPx = useMemo(() => {
        const mmToPx = 96 / 25.4;
        return {
            top: Math.round((pageSetup?.marginTop ?? 10) * mmToPx),
            right: Math.round((pageSetup?.marginRight ?? 10) * mmToPx),
            bottom: Math.round((pageSetup?.marginBottom ?? 10) * mmToPx),
            left: Math.round((pageSetup?.marginLeft ?? 10) * mmToPx),
        };
    }, [pageSetup]);

    const now = () => new Date().toISOString();

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        const hasNew = e.dataTransfer.types.includes('application/rb-component-type');
        const hasMove = e.dataTransfer.types.includes('application/rb-component-move');
        if (hasNew || hasMove) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = hasNew ? 'copy' : 'move';
            setDragOverIndex(index);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, insertIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverIndex(null);

        const newType = e.dataTransfer.getData('application/rb-component-type');
        if (newType) {
            const comp = createComponent(newType);
            store.setState((prev: ReportBuilderState) => {
                const next = [...prev.definition.components];
                next.splice(insertIndex, 0, comp);
                return {
                    ...prev,
                    definition: {
                        ...prev.definition,
                        components: next,
                        metadata: { ...prev.definition.metadata, updatedAt: now() },
                    },
                    selectedItemId: comp.id,
                    selectedItemType: 'component' as const,
                };
            });
            return;
        }

        const moveData = e.dataTransfer.getData('application/rb-component-move');
        if (moveData) {
            const parsed = JSON.parse(moveData) as { fromIndex: number };
            const { fromIndex } = parsed;
            if (fromIndex === insertIndex || fromIndex === insertIndex - 1) return;
            store.setState((prev: ReportBuilderState) => {
                const next = [...prev.definition.components];
                const [removed] = next.splice(fromIndex, 1);
                const adjusted = insertIndex > fromIndex ? insertIndex - 1 : insertIndex;
                next.splice(adjusted, 0, removed);
                return {
                    ...prev,
                    definition: {
                        ...prev.definition,
                        components: next,
                        metadata: { ...prev.definition.metadata, updatedAt: now() },
                    },
                };
            });
        }
    }, [store]);

    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null);
    }, []);

    const getContainerType = useCallback((containerId: string): 'column' | 'tab-panel' | 'canvas' | null => {
        const comp = findComponent(components, containerId);
        if (!comp) return null;
        if (comp.type === 'column') return 'column';
        if (comp.type === 'tab-panel') return 'tab-panel';
        if (comp.type === 'canvas') return 'canvas';
        return null;
    }, [components]);

    const handleContainerDrop = useCallback((
        e: React.DragEvent,
        containerId: string,
        insertIndex: number,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const containerType = getContainerType(containerId);

        const newType = e.dataTransfer.getData('application/rb-component-type');
        if (newType) {
            if (containerType && !isTypeAllowedInContainer(newType, containerType)) return;
            const comp = createComponent(newType);
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    components: insertIntoContainer(prev.definition.components, containerId, comp, insertIndex),
                    metadata: { ...prev.definition.metadata, updatedAt: now() },
                },
                selectedItemId: comp.id,
                selectedItemType: 'component' as const,
            }));
            return;
        }

        const moveData = e.dataTransfer.getData('application/rb-component-move-nested');
        if (moveData) {
            const parsed = JSON.parse(moveData) as { containerId: string; fromIndex: number };
            if (parsed.containerId !== containerId) return;
            const { fromIndex } = parsed;
            if (fromIndex === insertIndex || fromIndex === insertIndex - 1) return;
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    components: moveWithinContainer(prev.definition.components, containerId, fromIndex, insertIndex),
                    metadata: { ...prev.definition.metadata, updatedAt: now() },
                },
            }));
        }
    }, [store]);

    const handleSelect = useCallback((id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            selectedItemId: id,
            selectedItemType: 'component' as const,
        }));
    }, [store]);

    const handleDelete = useCallback((id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: deleteComponentFromTree(prev.definition.components, id),
                metadata: { ...prev.definition.metadata, updatedAt: now() },
            },
            selectedItemId: null,
            selectedItemType: 'none' as const,
        }));
    }, [store]);

    const handleDuplicate = useCallback((id: string) => {
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: duplicateComponent(prev.definition.components, id),
                metadata: { ...prev.definition.metadata, updatedAt: now() },
            },
        }));
    }, [store]);

    const handleMoveUp = useCallback((index: number) => {
        if (index === 0) return;
        store.setState((prev: ReportBuilderState) => {
            const next = [...prev.definition.components];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return {
                ...prev,
                definition: {
                    ...prev.definition,
                    components: next,
                    metadata: { ...prev.definition.metadata, updatedAt: now() },
                },
            };
        });
    }, [store]);

    const handleMoveDown = useCallback((index: number) => {
        store.setState((prev: ReportBuilderState) => {
            if (index >= prev.definition.components.length - 1) return prev;
            const next = [...prev.definition.components];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            return {
                ...prev,
                definition: {
                    ...prev.definition,
                    components: next,
                    metadata: { ...prev.definition.metadata, updatedAt: now() },
                },
            };
        });
    }, [store]);

    const handleAreaClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('eui-rb-design-area-inner')) {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                selectedItemId: null,
                selectedItemType: 'report-settings' as const,
            }));
        }
    }, [store]);

    return (
        <div
            className="eui-rb-design-area"
            onClick={handleAreaClick}
            onDragLeave={handleDragLeave}
            role="region"
            aria-label="Report design area"
        >
            <div
                className="eui-rb-design-area-inner"
                style={pageSetup ? {
                    maxWidth: pageDims.width,
                    margin: '0 auto',
                    padding: `${marginPx.top}px ${marginPx.right}px ${marginPx.bottom}px ${marginPx.left}px`,
                } : undefined}
            >
                {components.length === 0 ? (
                    <EmptyCanvas
                        onDragOver={(e) => handleDragOver(e, 0)}
                        onDrop={(e) => handleDrop(e, 0)}
                    />
                ) : (
                    <>
                        <DropZone
                            active={dragOverIndex === 0}
                            onDragOver={(e) => handleDragOver(e, 0)}
                            onDrop={(e) => handleDrop(e, 0)}
                            onDragLeave={handleDragLeave}
                        />
                        {components.map((comp, i) => (
                            <React.Fragment key={comp.id}>
                                <DesignComponent
                                    component={comp}
                                    index={i}
                                    total={components.length}
                                    selected={selectedId === comp.id}
                                    onSelect={handleSelect}
                                    onDelete={handleDelete}
                                    onDuplicate={handleDuplicate}
                                    onMoveUp={() => handleMoveUp(i)}
                                    onMoveDown={() => handleMoveDown(i)}
                                    isFirst={i === 0}
                                    isLast={i === components.length - 1}
                                    onContainerDrop={handleContainerDrop}
                                    selectedId={selectedId}
                                    onSelectNested={handleSelect}
                                    onDeleteNested={handleDelete}
                                    onDuplicateNested={handleDuplicate}
                                />
                                <DropZone
                                    active={dragOverIndex === i + 1}
                                    onDragOver={(e) => handleDragOver(e, i + 1)}
                                    onDrop={(e) => handleDrop(e, i + 1)}
                                    onDragLeave={handleDragLeave}
                                />
                            </React.Fragment>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};
