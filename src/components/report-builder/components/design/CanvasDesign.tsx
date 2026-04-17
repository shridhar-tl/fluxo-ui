import classNames from 'classnames';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { CopyIcon, TrashIcon } from '../../../../assets/icons';
import {
    createCanvasChild,
    isDragAllowedInContainer,
    isTypeAllowedInContainer,
} from '../../report-component-helpers';
import { useReportBuilderContext } from '../../report-builder-context';
import type { ReportBuilderState } from '../../report-builder-types';
import type { ReportComponent, CanvasComponentProps, CanvasItemLayout } from '../../report-definition-types';
import { updateComponentInTree, insertIntoContainer } from '../../report-component-helpers';
import { HeaderDesign } from './HeaderDesign';
import { TextDesign } from './TextDesign';
import { ImageDesign } from './ImageDesign';
import { HorizontalLineDesign } from './HorizontalLineDesign';
import { ChartDesign } from './ChartDesign';
import { TableDesign } from './TableDesign';
import { SubReportDesign } from './SubReportDesign';

interface CanvasDesignProps {
    component: ReportComponent;
    selectedId: string | null;
    onSelectNested: (id: string) => void;
    onDeleteNested: (id: string) => void;
    onDuplicateNested: (id: string) => void;
    selectedIds?: Set<string>;
    onMultiSelect?: (ids: Set<string>) => void;
}

const defaultLayout: CanvasItemLayout = { x: 20, y: 20, width: 200, height: 100 };
const alignThreshold = 5;

function getLayout(comp: ReportComponent): CanvasItemLayout {
    return (comp.props.canvasLayout as CanvasItemLayout) ?? defaultLayout;
}

function snapValue(value: number, gridSize: number): number {
    return Math.round(value / gridSize) * gridSize;
}

interface AlignmentGuide {
    type: 'horizontal' | 'vertical';
    position: number;
}

function computeAlignmentGuides(
    movingId: string,
    movingLayout: CanvasItemLayout,
    siblings: ReportComponent[],
): AlignmentGuide[] {
    const guides: AlignmentGuide[] = [];
    const mx = movingLayout.x;
    const my = movingLayout.y;
    const mxEnd = mx + movingLayout.width;
    const myEnd = my + movingLayout.height;
    const mxCenter = mx + movingLayout.width / 2;
    const myCenter = my + movingLayout.height / 2;

    for (const sibling of siblings) {
        if (sibling.id === movingId) continue;
        const sl = getLayout(sibling);
        const sx = sl.x;
        const sy = sl.y;
        const sxEnd = sx + sl.width;
        const syEnd = sy + sl.height;
        const sxCenter = sx + sl.width / 2;
        const syCenter = sy + sl.height / 2;

        if (Math.abs(mx - sx) <= alignThreshold) guides.push({ type: 'vertical', position: sx });
        if (Math.abs(mxEnd - sxEnd) <= alignThreshold) guides.push({ type: 'vertical', position: sxEnd });
        if (Math.abs(mxCenter - sxCenter) <= alignThreshold) guides.push({ type: 'vertical', position: sxCenter });
        if (Math.abs(mx - sxEnd) <= alignThreshold) guides.push({ type: 'vertical', position: sxEnd });
        if (Math.abs(mxEnd - sx) <= alignThreshold) guides.push({ type: 'vertical', position: sx });

        if (Math.abs(my - sy) <= alignThreshold) guides.push({ type: 'horizontal', position: sy });
        if (Math.abs(myEnd - syEnd) <= alignThreshold) guides.push({ type: 'horizontal', position: syEnd });
        if (Math.abs(myCenter - syCenter) <= alignThreshold) guides.push({ type: 'horizontal', position: syCenter });
        if (Math.abs(my - syEnd) <= alignThreshold) guides.push({ type: 'horizontal', position: syEnd });
        if (Math.abs(myEnd - sy) <= alignThreshold) guides.push({ type: 'horizontal', position: sy });
    }

    const unique = new Map<string, AlignmentGuide>();
    for (const g of guides) {
        unique.set(`${g.type}-${g.position}`, g);
    }
    return Array.from(unique.values());
}

function renderChild(comp: ReportComponent): React.ReactNode {
    switch (comp.type) {
        case 'header': return <HeaderDesign component={comp} />;
        case 'text': return <TextDesign component={comp} />;
        case 'image': return <ImageDesign component={comp} />;
        case 'horizontal-line': return <HorizontalLineDesign component={comp} />;
        case 'table': return <TableDesign component={comp} />;
        case 'sub-report': return <SubReportDesign component={comp} />;
        case 'chart-bar':
        case 'chart-pie':
        case 'chart-donut':
        case 'chart-line':
            return <ChartDesign component={comp} />;
        default:
            return <div style={{ padding: 8, color: 'var(--eui-text-muted)', fontSize: 11 }}>{comp.type}</div>;
    }
}

export const CanvasDesign: React.FC<CanvasDesignProps> = ({
    component,
    selectedId,
    onSelectNested,
    onDeleteNested,
    onDuplicateNested,
    selectedIds: externalSelectedIds,
    onMultiSelect,
}) => {
    const { store } = useReportBuilderContext();
    const p = component.props as unknown as CanvasComponentProps;
    const children = component.children ?? [];
    const canvasRef = useRef<HTMLDivElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [guides, setGuides] = useState<AlignmentGuide[]>([]);
    const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
    const [lassoRect, setLassoRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const lassoRef = useRef<{ startX: number; startY: number } | null>(null);
    const snapEnabled = p.snapToGrid ?? false;
    const gridSize = p.gridSize ?? 10;

    const multiSelectedIds = externalSelectedIds ?? internalSelectedIds;
    const setMultiSelectedIds = onMultiSelect ?? setInternalSelectedIds;

    const updateChildLayout = useCallback((childId: string, layout: Partial<CanvasItemLayout>) => {
        let snappedLayout = layout;
        if (snapEnabled) {
            snappedLayout = { ...layout };
            if (snappedLayout.x !== undefined) snappedLayout.x = snapValue(snappedLayout.x, gridSize);
            if (snappedLayout.y !== undefined) snappedLayout.y = snapValue(snappedLayout.y, gridSize);
            if (snappedLayout.width !== undefined) snappedLayout.width = snapValue(snappedLayout.width, gridSize);
            if (snappedLayout.height !== undefined) snappedLayout.height = snapValue(snappedLayout.height, gridSize);
        }

        store.setState((prev: ReportBuilderState) => {
            const newComponents = updateComponentInTree(prev.definition.components, childId, (c) => ({
                ...c,
                props: {
                    ...c.props,
                    canvasLayout: { ...getLayout(c), ...snappedLayout },
                },
            }));

            return {
                ...prev,
                definition: {
                    ...prev.definition,
                    components: newComponents,
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            };
        });

        const currentChild = children.find((c) => c.id === childId);
        if (currentChild) {
            const currentLayout = getLayout(currentChild);
            const mergedLayout = { ...currentLayout, ...snappedLayout };
            setGuides(computeAlignmentGuides(childId, mergedLayout, children));
        }
    }, [store, snapEnabled, gridSize, children]);

    const updateMultiChildLayouts = useCallback((deltas: { dx: number; dy: number }) => {
        store.setState((prev: ReportBuilderState) => {
            let newComponents = prev.definition.components;
            for (const childId of multiSelectedIds) {
                const child = children.find((c) => c.id === childId);
                if (!child) continue;
                const layout = getLayout(child);
                let newX = Math.max(0, layout.x + deltas.dx);
                let newY = Math.max(0, layout.y + deltas.dy);
                if (snapEnabled) {
                    newX = snapValue(newX, gridSize);
                    newY = snapValue(newY, gridSize);
                }
                newComponents = updateComponentInTree(newComponents, childId, (c) => ({
                    ...c,
                    props: {
                        ...c.props,
                        canvasLayout: { ...getLayout(c), x: newX, y: newY },
                    },
                }));
            }
            return {
                ...prev,
                definition: {
                    ...prev.definition,
                    components: newComponents,
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            };
        });
    }, [store, multiSelectedIds, children, snapEnabled, gridSize]);

    const clearGuides = useCallback(() => setGuides([]), []);

    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (e.target === canvasRef.current || e.target === canvasRef.current?.firstChild) {
            setMultiSelectedIds(new Set());
        }
    }, [setMultiSelectedIds]);

    const lassoRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

    const handleLassoStart = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!canvasRef.current) return;
        if (target !== canvasRef.current && !target.closest('svg[aria-hidden]') && target.closest('.eui-rb-canvas-item')) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;
        lassoRef.current = { startX, startY };

        const handleMouseMove = (ev: MouseEvent) => {
            if (!lassoRef.current || !canvasRef.current) return;
            const r = canvasRef.current.getBoundingClientRect();
            const curX = ev.clientX - r.left;
            const curY = ev.clientY - r.top;
            const x = Math.min(lassoRef.current.startX, curX);
            const y = Math.min(lassoRef.current.startY, curY);
            const w = Math.abs(curX - lassoRef.current.startX);
            const h = Math.abs(curY - lassoRef.current.startY);
            const lr = { x, y, w, h };
            lassoRectRef.current = lr;
            setLassoRect(lr);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            const lr = lassoRectRef.current;
            if (lr && lr.w > 5 && lr.h > 5) {
                const selected = new Set<string>();
                for (const child of children) {
                    const cl = getLayout(child);
                    if (
                        cl.x < lr.x + lr.w &&
                        cl.x + cl.width > lr.x &&
                        cl.y < lr.y + lr.h &&
                        cl.y + cl.height > lr.y
                    ) {
                        selected.add(child.id);
                    }
                }
                if (selected.size > 0) setMultiSelectedIds(selected);
            }
            lassoRef.current = null;
            lassoRectRef.current = null;
            setLassoRect(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [children, setMultiSelectedIds]);

    const handleItemSelect = useCallback((id: string, ctrlKey: boolean) => {
        if (ctrlKey) {
            const next = new Set(multiSelectedIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setMultiSelectedIds(next);
            onSelectNested(id);
        } else {
            setMultiSelectedIds(new Set([id]));
            onSelectNested(id);
        }
    }, [multiSelectedIds, setMultiSelectedIds, onSelectNested]);

    const handleCanvasDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        const newType = e.dataTransfer.getData('application/rb-component-type');
        if (!newType) return;
        if (!isTypeAllowedInContainer(newType, 'canvas')) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = Math.max(0, e.clientX - rect.left - 20);
        const y = Math.max(0, e.clientY - rect.top - 20);

        const comp = createCanvasChild(newType);
        comp.props = { ...comp.props, canvasLayout: { x, y, width: 200, height: 100 } };

        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: insertIntoContainer(prev.definition.components, component.id, comp, children.length),
                metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
            },
            selectedItemId: comp.id,
            selectedItemType: 'component' as const,
        }));
    }, [store, component.id, children.length]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        const hasNew = e.dataTransfer.types.includes('application/rb-component-type');
        if (hasNew && isDragAllowedInContainer(e.dataTransfer.types, 'canvas')) {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(true);
        }
    }, []);

    const alignItems = useCallback((alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v') => {
        if (multiSelectedIds.size < 2) return;
        const items = children.filter((c) => multiSelectedIds.has(c.id));
        const layouts = items.map((c) => ({ id: c.id, ...getLayout(c) }));

        let targetValue: number;
        store.setState((prev: ReportBuilderState) => {
            let newComponents = prev.definition.components;
            switch (alignment) {
                case 'left':
                    targetValue = Math.min(...layouts.map((l) => l.x));
                    for (const item of layouts) {
                        newComponents = updateComponentInTree(newComponents, item.id, (c) => ({
                            ...c, props: { ...c.props, canvasLayout: { ...getLayout(c), x: targetValue } },
                        }));
                    }
                    break;
                case 'right':
                    targetValue = Math.max(...layouts.map((l) => l.x + l.width));
                    for (const item of layouts) {
                        newComponents = updateComponentInTree(newComponents, item.id, (c) => ({
                            ...c, props: { ...c.props, canvasLayout: { ...getLayout(c), x: targetValue - getLayout(c).width } },
                        }));
                    }
                    break;
                case 'top':
                    targetValue = Math.min(...layouts.map((l) => l.y));
                    for (const item of layouts) {
                        newComponents = updateComponentInTree(newComponents, item.id, (c) => ({
                            ...c, props: { ...c.props, canvasLayout: { ...getLayout(c), y: targetValue } },
                        }));
                    }
                    break;
                case 'bottom':
                    targetValue = Math.max(...layouts.map((l) => l.y + l.height));
                    for (const item of layouts) {
                        newComponents = updateComponentInTree(newComponents, item.id, (c) => ({
                            ...c, props: { ...c.props, canvasLayout: { ...getLayout(c), y: targetValue - getLayout(c).height } },
                        }));
                    }
                    break;
                case 'center-h': {
                    const minX = Math.min(...layouts.map((l) => l.x));
                    const maxX = Math.max(...layouts.map((l) => l.x + l.width));
                    const centerX = (minX + maxX) / 2;
                    for (const item of layouts) {
                        newComponents = updateComponentInTree(newComponents, item.id, (c) => ({
                            ...c, props: { ...c.props, canvasLayout: { ...getLayout(c), x: centerX - getLayout(c).width / 2 } },
                        }));
                    }
                    break;
                }
                case 'center-v': {
                    const minY = Math.min(...layouts.map((l) => l.y));
                    const maxY = Math.max(...layouts.map((l) => l.y + l.height));
                    const centerY = (minY + maxY) / 2;
                    for (const item of layouts) {
                        newComponents = updateComponentInTree(newComponents, item.id, (c) => ({
                            ...c, props: { ...c.props, canvasLayout: { ...getLayout(c), y: centerY - getLayout(c).height / 2 } },
                        }));
                    }
                    break;
                }
            }
            return {
                ...prev,
                definition: {
                    ...prev.definition,
                    components: newComponents,
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            };
        });
    }, [multiSelectedIds, children, store]);

    const distributeItems = useCallback((direction: 'horizontal' | 'vertical') => {
        if (multiSelectedIds.size < 3) return;
        const items = children.filter((c) => multiSelectedIds.has(c.id));
        const layouts = items.map((c) => ({ id: c.id, ...getLayout(c) }));

        store.setState((prev: ReportBuilderState) => {
            let newComponents = prev.definition.components;
            if (direction === 'horizontal') {
                layouts.sort((a, b) => a.x - b.x);
                const firstX = layouts[0].x;
                const lastX = layouts[layouts.length - 1].x;
                const spacing = (lastX - firstX) / (layouts.length - 1);
                for (let i = 1; i < layouts.length - 1; i++) {
                    const newX = firstX + spacing * i;
                    newComponents = updateComponentInTree(newComponents, layouts[i].id, (c) => ({
                        ...c, props: { ...c.props, canvasLayout: { ...getLayout(c), x: Math.round(newX) } },
                    }));
                }
            } else {
                layouts.sort((a, b) => a.y - b.y);
                const firstY = layouts[0].y;
                const lastY = layouts[layouts.length - 1].y;
                const spacing = (lastY - firstY) / (layouts.length - 1);
                for (let i = 1; i < layouts.length - 1; i++) {
                    const newY = firstY + spacing * i;
                    newComponents = updateComponentInTree(newComponents, layouts[i].id, (c) => ({
                        ...c, props: { ...c.props, canvasLayout: { ...getLayout(c), y: Math.round(newY) } },
                    }));
                }
            }
            return {
                ...prev,
                definition: {
                    ...prev.definition,
                    components: newComponents,
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            };
        });
    }, [multiSelectedIds, children, store]);

    const gridPattern = useMemo(() => {
        if (!snapEnabled || gridSize < 5) return null;
        return (
            <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.3 }}
                aria-hidden="true"
            >
                <defs>
                    <pattern id={`grid-${component.id}`} width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                        <circle cx={1} cy={1} r={0.5} fill="var(--eui-text-muted)" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-${component.id})`} />
            </svg>
        );
    }, [snapEnabled, gridSize, component.id]);

    const showMultiToolbar = multiSelectedIds.size > 1;

    return (
        <div
            ref={canvasRef}
            className={classNames('eui-rb-canvas-design', { 'drag-over': dragOver })}
            style={{
                position: 'relative',
                width: p.width ?? '100%',
                height: p.height ?? '400px',
                minHeight: 200,
                border: '1px dashed var(--eui-border-subtle)',
                borderRadius: 6,
                background: 'var(--eui-bg-subtle)',
                overflow: 'hidden',
            }}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleCanvasDrop}
            onClick={handleCanvasClick}
            onMouseDown={handleLassoStart}
        >
            {gridPattern}
            {lassoRect && (
                <div
                    style={{
                        position: 'absolute',
                        left: lassoRect.x,
                        top: lassoRect.y,
                        width: lassoRect.w,
                        height: lassoRect.h,
                        border: '1px dashed var(--eui-primary)',
                        background: 'rgba(79, 135, 247, 0.08)',
                        pointerEvents: 'none',
                        zIndex: 15,
                    }}
                    aria-hidden="true"
                />
            )}
            {showMultiToolbar && (
                <div
                    style={{
                        position: 'absolute',
                        top: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 2,
                        background: 'var(--eui-bg)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 4,
                        padding: 3,
                        zIndex: 20,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}
                    role="toolbar"
                    aria-label="Multi-select alignment"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <button className="eui-rb-design-comp-toolbar-btn" onClick={() => alignItems('left')} title="Align left" aria-label="Align left">⫷</button>
                    <button className="eui-rb-design-comp-toolbar-btn" onClick={() => alignItems('center-h')} title="Align center horizontally" aria-label="Align center horizontally">⫿</button>
                    <button className="eui-rb-design-comp-toolbar-btn" onClick={() => alignItems('right')} title="Align right" aria-label="Align right">⫸</button>
                    <div style={{ width: 1, height: 16, background: 'var(--eui-border-subtle)', margin: '0 2px', alignSelf: 'center' }} />
                    <button className="eui-rb-design-comp-toolbar-btn" onClick={() => alignItems('top')} title="Align top" aria-label="Align top">⫠</button>
                    <button className="eui-rb-design-comp-toolbar-btn" onClick={() => alignItems('center-v')} title="Align center vertically" aria-label="Align center vertically">⫰</button>
                    <button className="eui-rb-design-comp-toolbar-btn" onClick={() => alignItems('bottom')} title="Align bottom" aria-label="Align bottom">⫡</button>
                    {multiSelectedIds.size >= 3 && (
                        <>
                            <div style={{ width: 1, height: 16, background: 'var(--eui-border-subtle)', margin: '0 2px', alignSelf: 'center' }} />
                            <button className="eui-rb-design-comp-toolbar-btn" onClick={() => distributeItems('horizontal')} title="Distribute horizontally" aria-label="Distribute horizontally">⋯</button>
                            <button className="eui-rb-design-comp-toolbar-btn" onClick={() => distributeItems('vertical')} title="Distribute vertically" aria-label="Distribute vertically">⋮</button>
                        </>
                    )}
                </div>
            )}
            {guides.map((guide, idx) => (
                <div
                    key={`${guide.type}-${guide.position}-${idx}`}
                    style={{
                        position: 'absolute',
                        ...(guide.type === 'vertical'
                            ? { left: guide.position, top: 0, width: 1, height: '100%' }
                            : { top: guide.position, left: 0, height: 1, width: '100%' }),
                        background: 'var(--eui-primary)',
                        opacity: 0.5,
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                    aria-hidden="true"
                />
            ))}
            {children.length === 0 && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--eui-text-muted)',
                    fontSize: 12,
                    pointerEvents: 'none',
                }}>
                    Drop components here — freely position and resize them
                </div>
            )}
            {children.map((child) => (
                <CanvasItem
                    key={child.id}
                    child={child}
                    selected={selectedId === child.id || multiSelectedIds.has(child.id)}
                    onSelect={handleItemSelect}
                    onDelete={onDeleteNested}
                    onDuplicate={onDuplicateNested}
                    onLayoutChange={updateChildLayout}
                    onMoveEnd={clearGuides}
                    isMultiSelected={multiSelectedIds.has(child.id) && multiSelectedIds.size > 1}
                    onGroupMove={multiSelectedIds.size > 1 && multiSelectedIds.has(child.id) ? updateMultiChildLayouts : undefined}
                    siblings={children}
                    onGuidesChange={setGuides}
                />
            ))}
        </div>
    );
};

const CanvasItem: React.FC<{
    child: ReportComponent;
    selected: boolean;
    onSelect: (id: string, ctrlKey: boolean) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onLayoutChange: (id: string, layout: Partial<CanvasItemLayout>) => void;
    onMoveEnd?: () => void;
    isMultiSelected?: boolean;
    onGroupMove?: (deltas: { dx: number; dy: number }) => void;
    siblings?: ReportComponent[];
    onGuidesChange?: (guides: AlignmentGuide[]) => void;
}> = ({ child, selected, onSelect, onDelete, onDuplicate, onLayoutChange, onMoveEnd, isMultiSelected, onGroupMove, siblings, onGuidesChange }) => {
    const layout = getLayout(child);
    const [hovered, setHovered] = useState(false);
    const showControls = selected || hovered;
    const dragRef = useRef<{ startX: number; startY: number; startLayout: CanvasItemLayout } | null>(null);

    const handleMoveStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current = { startX: e.clientX, startY: e.clientY, startLayout: { ...layout } };

        const handleMouseMove = (ev: MouseEvent) => {
            if (!dragRef.current) return;
            const dx = ev.clientX - dragRef.current.startX;
            const dy = ev.clientY - dragRef.current.startY;
            if (isMultiSelected && onGroupMove) {
                onGroupMove({ dx, dy });
            } else {
                onLayoutChange(child.id, {
                    x: Math.max(0, dragRef.current.startLayout.x + dx),
                    y: Math.max(0, dragRef.current.startLayout.y + dy),
                });
            }
        };

        const handleMouseUp = () => {
            dragRef.current = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            onMoveEnd?.();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
    }, [child.id, layout, onLayoutChange, onMoveEnd, isMultiSelected, onGroupMove]);

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current = { startX: e.clientX, startY: e.clientY, startLayout: { ...layout } };

        const handleMouseMove = (ev: MouseEvent) => {
            if (!dragRef.current) return;
            const dx = ev.clientX - dragRef.current.startX;
            const dy = ev.clientY - dragRef.current.startY;
            const newW = Math.max(60, dragRef.current.startLayout.width + dx);
            const newH = Math.max(40, dragRef.current.startLayout.height + dy);
            onLayoutChange(child.id, { width: newW, height: newH });
            if (siblings && onGuidesChange) {
                const resizedLayout = { ...dragRef.current.startLayout, width: newW, height: newH };
                onGuidesChange(computeAlignmentGuides(child.id, resizedLayout, siblings));
            }
        };

        const handleMouseUp = () => {
            dragRef.current = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            onMoveEnd?.();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'se-resize';
        document.body.style.userSelect = 'none';
    }, [child.id, layout, onLayoutChange, onMoveEnd, siblings, onGuidesChange]);

    return (
        <div
            className={classNames('eui-rb-canvas-item', { selected, hovered })}
            style={{
                position: 'absolute',
                left: layout.x,
                top: layout.y,
                width: layout.width,
                height: layout.height,
                border: selected ? `2px solid ${isMultiSelected ? 'var(--eui-primary-border)' : 'var(--eui-primary)'}` : '1px solid var(--eui-border-subtle)',
                borderRadius: 4,
                background: 'var(--eui-bg)',
                overflow: 'hidden',
                cursor: 'move',
            }}
            onClick={(e) => { e.stopPropagation(); onSelect(child.id, e.ctrlKey || e.metaKey); }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseDown={handleMoveStart}
            role="treeitem"
            aria-selected={selected}
            tabIndex={0}
        >
            <div style={{ pointerEvents: 'none', overflow: 'hidden', width: '100%', height: '100%' }}>
                {renderChild(child)}
            </div>

            {showControls && (
                <div
                    style={{
                        position: 'absolute',
                        top: -1,
                        right: -1,
                        display: 'flex',
                        gap: 2,
                        background: 'var(--eui-bg)',
                        borderRadius: '0 4px 0 4px',
                        padding: '2px 4px',
                        border: '1px solid var(--eui-border-subtle)',
                        zIndex: 2,
                    }}
                    role="toolbar"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <button
                        className="eui-rb-design-comp-toolbar-btn"
                        onClick={(e) => { e.stopPropagation(); onDuplicate(child.id); }}
                        title="Duplicate"
                        aria-label="Duplicate"
                    >
                        <CopyIcon aria-hidden="true" />
                    </button>
                    <button
                        className="eui-rb-design-comp-toolbar-btn danger"
                        onClick={(e) => { e.stopPropagation(); onDelete(child.id); }}
                        title="Delete"
                        aria-label="Delete"
                    >
                        <TrashIcon aria-hidden="true" />
                    </button>
                </div>
            )}

            {showControls && (
                <div
                    onMouseDown={handleResizeStart}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        cursor: 'se-resize',
                        zIndex: 2,
                    }}
                    role="separator"
                    aria-label="Resize"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') { e.preventDefault(); onLayoutChange(child.id, { width: layout.width + 10 }); }
                        if (e.key === 'ArrowDown') { e.preventDefault(); onLayoutChange(child.id, { height: layout.height + 10 }); }
                        if (e.key === 'ArrowLeft') { e.preventDefault(); onLayoutChange(child.id, { width: Math.max(60, layout.width - 10) }); }
                        if (e.key === 'ArrowUp') { e.preventDefault(); onLayoutChange(child.id, { height: Math.max(40, layout.height - 10) }); }
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" style={{ opacity: 0.4 }}>
                        <path d="M11 1L1 11M11 5L5 11M11 9L9 11" stroke="var(--eui-text)" strokeWidth="1.5" />
                    </svg>
                </div>
            )}
        </div>
    );
};
