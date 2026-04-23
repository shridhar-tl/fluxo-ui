import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { useRBStore } from '../../report-builder-context';
import { isDragAllowedInContainer } from '../../report-component-helpers';
import type {
    ReportComponent,
    RepeaterComponentProps,
} from '../../report-definition-types';
import { NestedDesignComponent } from './NestedDesignComponent';

interface RepeaterDesignProps {
    component: ReportComponent;
    onContainerDrop: (e: React.DragEvent, containerId: string, insertIndex: number) => void;
    selectedId: string | null;
    onSelectNested: (id: string) => void;
    onDeleteNested: (id: string) => void;
    onDuplicateNested: (id: string) => void;
}

const previewCount = 3;

export const RepeaterDesign: React.FC<RepeaterDesignProps> = ({
    component,
    onContainerDrop,
    selectedId,
    onSelectNested,
    onDeleteNested,
    onDuplicateNested,
}) => {
    const p = component.props as unknown as RepeaterComponentProps;
    const [dragOver, setDragOver] = useState(false);
    const children = component.children ?? [];
    const datasources = useRBStore((s) => s.definition.datasources, true);

    const dsName = useMemo(() => {
        if (!p.datasourceId) return null;
        return datasources.find((d) => d.id === p.datasourceId)?.name ?? null;
    }, [datasources, p.datasourceId]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        const hasNew = e.dataTransfer.types.includes('application/rb-component-type');
        const hasMove = e.dataTransfer.types.includes('application/rb-component-move-nested');
        if ((hasNew || hasMove) && isDragAllowedInContainer(e.dataTransfer.types, 'repeater')) {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(true);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, insertIndex: number) => {
        setDragOver(false);
        onContainerDrop(e, component.id, insertIndex);
    }, [component.id, onContainerDrop]);

    const bindingSummary = useMemo(() => {
        if (dsName) return `Iterating over "${dsName}"`;
        if (p.datasetExpression && p.datasetExpression.trim() !== '') return 'Iterating over expression';
        return 'Bind a datasource or dataset expression';
    }, [dsName, p.datasetExpression]);

    const layout = p.layout ?? 'stack';
    const gap = p.gap ?? 8;
    const gridColumns = p.gridColumns ?? 2;
    const inlineWrap = p.inlineWrap ?? true;

    const slotStyle: React.CSSProperties = useMemo(() => {
        if (layout === 'grid') {
            return {
                display: 'grid',
                gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                gap,
            };
        }
        if (layout === 'inline') {
            return {
                display: 'flex',
                flexDirection: 'row',
                flexWrap: inlineWrap ? 'wrap' : 'nowrap',
                gap,
            };
        }
        return {
            display: 'flex',
            flexDirection: 'column',
            gap,
        };
    }, [layout, gap, gridColumns, inlineWrap]);

    const separator = p.separator ?? 'none';

    return (
        <div className="eui-rb-repeater-design">
            <div className="eui-rb-repeater-design-header" aria-hidden="true">
                <span className="eui-rb-repeater-design-binding">{bindingSummary}</span>
                <span className="eui-rb-repeater-design-layout">
                    {layout}{layout === 'grid' ? ` · ${gridColumns} cols` : ''}
                </span>
            </div>

            <div
                className={classNames('eui-rb-repeater-design-body', { 'drag-over': dragOver })}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => handleDrop(e, children.length)}
            >
                {children.length === 0 ? (
                    <div className="eui-rb-col-empty">
                        Drop components here — they'll render once per row.
                    </div>
                ) : (
                    <div className="eui-rb-repeater-design-preview" style={slotStyle}>
                        {Array.from({ length: previewCount }).map((_, iter) => (
                            <div
                                key={`iter-${iter}`}
                                className={classNames('eui-rb-repeater-design-iter', {
                                    alt: p.alternateRowBackground && iter % 2 === 1,
                                    primary: iter === 0,
                                })}
                                data-iter-label={`#${iter + 1}`}
                            >
                                <div className="eui-rb-repeater-design-iter-children">
                                    {children.map((child, i) => (
                                        <NestedDesignComponent
                                            key={`${child.id}-${iter}`}
                                            component={child}
                                            index={i}
                                            containerId={component.id}
                                            selected={iter === 0 && selectedId === child.id}
                                            onSelect={iter === 0 ? onSelectNested : () => undefined}
                                            onDelete={iter === 0 ? onDeleteNested : () => undefined}
                                            onDuplicate={iter === 0 ? onDuplicateNested : () => undefined}
                                        />
                                    ))}
                                </div>
                                {separator !== 'none' && iter < previewCount - 1 && (
                                    <div
                                        className={classNames('eui-rb-repeater-design-sep', separator)}
                                        aria-hidden="true"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="eui-rb-repeater-design-footer" aria-hidden="true">
                Preview shows a synthetic {previewCount}-row sample. Runtime count depends on the dataset.
            </div>
        </div>
    );
};
