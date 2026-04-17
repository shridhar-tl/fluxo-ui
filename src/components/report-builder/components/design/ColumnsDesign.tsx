import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { isDragAllowedInContainer } from '../../report-component-helpers';
import type { ReportComponent, ColumnsComponentProps } from '../../report-definition-types';
import { NestedDesignComponent } from './NestedDesignComponent';

interface ColumnsDesignProps {
    component: ReportComponent;
    onContainerDrop: (e: React.DragEvent, containerId: string, insertIndex: number) => void;
    selectedId: string | null;
    onSelectNested: (id: string) => void;
    onDeleteNested: (id: string) => void;
    onDuplicateNested: (id: string) => void;
}

export const ColumnsDesign: React.FC<ColumnsDesignProps> = ({
    component,
    onContainerDrop,
    selectedId,
    onSelectNested,
    onDeleteNested,
    onDuplicateNested,
}) => {
    const p = component.props as unknown as ColumnsComponentProps;
    const columns = component.children ?? [];
    const columnCount = p.columnCount ?? (columns.length || 2);

    return (
        <div
            className="eui-rb-columns-design"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                gap: 8,
                padding: 4,
            }}
        >
            {columns.map((col) => (
                <ColumnDropZone
                    key={col.id}
                    column={col}
                    onContainerDrop={onContainerDrop}
                    selectedId={selectedId}
                    onSelectNested={onSelectNested}
                    onDeleteNested={onDeleteNested}
                    onDuplicateNested={onDuplicateNested}
                />
            ))}
        </div>
    );
};

interface ColumnDropZoneProps {
    column: ReportComponent;
    onContainerDrop: (e: React.DragEvent, containerId: string, insertIndex: number) => void;
    selectedId: string | null;
    onSelectNested: (id: string) => void;
    onDeleteNested: (id: string) => void;
    onDuplicateNested: (id: string) => void;
}

const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({
    column,
    onContainerDrop,
    selectedId,
    onSelectNested,
    onDeleteNested,
    onDuplicateNested,
}) => {
    const [dragOver, setDragOver] = useState(false);
    const children = column.children ?? [];

    const handleDragOver = useCallback((e: React.DragEvent) => {
        const hasNew = e.dataTransfer.types.includes('application/rb-component-type');
        const hasMove = e.dataTransfer.types.includes('application/rb-component-move-nested');
        if ((hasNew || hasMove) && isDragAllowedInContainer(e.dataTransfer.types, 'column')) {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(true);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, insertIndex: number) => {
        setDragOver(false);
        onContainerDrop(e, column.id, insertIndex);
    }, [column.id, onContainerDrop]);

    return (
        <div
            className={classNames('eui-rb-col-drop', { 'drag-over': dragOver })}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => handleDrop(e, children.length)}
        >
            {children.length === 0 ? (
                <div className="eui-rb-col-empty">Drop here</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {children.map((child, i) => (
                        <NestedDesignComponent
                            key={child.id}
                            component={child}
                            index={i}
                            containerId={column.id}
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
