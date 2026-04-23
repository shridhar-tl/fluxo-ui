import classNames from 'classnames';
import React, { useState } from 'react';
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CopyIcon,
    TrashIcon,
} from '../../../../assets/icons';
import type { ReportComponent } from '../../report-definition-types';
import { HeaderDesign } from './HeaderDesign';
import { TextDesign } from './TextDesign';
import { ImageDesign } from './ImageDesign';
import { HorizontalLineDesign } from './HorizontalLineDesign';
import { ColumnsDesign } from './ColumnsDesign';
import { TabDesign } from './TabDesign';
import { TableDesign } from './TableDesign';
import { SubReportDesign } from './SubReportDesign';
import { CanvasDesign } from './CanvasDesign';
import { ChartDesign } from './ChartDesign';
import { RepeaterDesign } from './RepeaterDesign';

interface DesignComponentProps {
    component: ReportComponent;
    index: number;
    total: number;
    selected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
    onContainerDrop: (e: React.DragEvent, containerId: string, insertIndex: number) => void;
    selectedId: string | null;
    onSelectNested: (id: string) => void;
    onDeleteNested: (id: string) => void;
    onDuplicateNested: (id: string) => void;
}

const typeLabels: Record<string, string> = {
    header: 'Header',
    text: 'Text',
    image: 'Image',
    'horizontal-line': 'H. Line',
    columns: 'Columns',
    tab: 'Tabs',
    table: 'Table',
    'sub-report': 'Sub-report',
    'chart-bar': 'Bar Chart',
    'chart-pie': 'Pie Chart',
    'chart-donut': 'Donut Chart',
    'chart-line': 'Line Chart',
    canvas: 'Canvas',
    repeater: 'Repeater',
};

const UnsupportedDesign: React.FC<{ type: string }> = ({ type }) => (
    <div style={{
        padding: '12px 16px',
        background: 'var(--eui-bg-subtle)',
        border: '1px dashed var(--eui-border-subtle)',
        borderRadius: 4,
        color: 'var(--eui-text-muted)',
        fontSize: 12,
        fontStyle: 'italic',
    }}>
        {typeLabels[type] ?? type} — Phase 6
    </div>
);

function renderDesignContent(
    comp: ReportComponent,
    onContainerDrop: (e: React.DragEvent, containerId: string, insertIndex: number) => void,
    selectedId: string | null,
    onSelectNested: (id: string) => void,
    onDeleteNested: (id: string) => void,
    onDuplicateNested: (id: string) => void,
): React.ReactNode {
    switch (comp.type) {
        case 'header':
            return <HeaderDesign component={comp} />;
        case 'text':
            return <TextDesign component={comp} />;
        case 'image':
            return <ImageDesign component={comp} />;
        case 'horizontal-line':
            return <HorizontalLineDesign component={comp} />;
        case 'columns':
            return (
                <ColumnsDesign
                    component={comp}
                    onContainerDrop={onContainerDrop}
                    selectedId={selectedId}
                    onSelectNested={onSelectNested}
                    onDeleteNested={onDeleteNested}
                    onDuplicateNested={onDuplicateNested}
                />
            );
        case 'tab':
            return (
                <TabDesign
                    component={comp}
                    onContainerDrop={onContainerDrop}
                    selectedId={selectedId}
                    onSelectNested={onSelectNested}
                    onDeleteNested={onDeleteNested}
                    onDuplicateNested={onDuplicateNested}
                />
            );
        case 'repeater':
            return (
                <RepeaterDesign
                    component={comp}
                    onContainerDrop={onContainerDrop}
                    selectedId={selectedId}
                    onSelectNested={onSelectNested}
                    onDeleteNested={onDeleteNested}
                    onDuplicateNested={onDuplicateNested}
                />
            );
        case 'table':
            return <TableDesign component={comp} />;
        case 'canvas':
            return (
                <CanvasDesign
                    component={comp}
                    selectedId={selectedId}
                    onSelectNested={onSelectNested}
                    onDeleteNested={onDeleteNested}
                    onDuplicateNested={onDuplicateNested}
                />
            );
        case 'sub-report':
            return <SubReportDesign component={comp} />;
        case 'chart-bar':
        case 'chart-pie':
        case 'chart-donut':
        case 'chart-line':
            return <ChartDesign component={comp} />;
        default:
            return <UnsupportedDesign type={comp.type} />;
    }
}

export const DesignComponent: React.FC<DesignComponentProps> = ({
    component,
    index,
    total,
    selected,
    onSelect,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
    onContainerDrop,
    selectedId,
    onSelectNested,
    onDeleteNested,
    onDuplicateNested,
}) => {
    const [hovered, setHovered] = useState(false);
    const showControls = selected || hovered;

    return (
        <div
            className={classNames('eui-rb-design-comp', { selected, hovered })}
            onClick={(e) => { e.stopPropagation(); onSelect(component.id); }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData(
                    'application/rb-component-move',
                    JSON.stringify({ id: component.id, fromIndex: index }),
                );
                e.dataTransfer.setData(`application/rb-type-${component.type}`, '1');
                e.dataTransfer.effectAllowed = 'move';
            }}
            role="treeitem"
            aria-selected={selected}
            aria-label={`${typeLabels[component.type] ?? component.type} component`}
            aria-posinset={index + 1}
            aria-setsize={total}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(component.id); }
                if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(component.id); }
                if (e.key === 'ArrowUp' && !isFirst) { e.preventDefault(); onMoveUp(); }
                if (e.key === 'ArrowDown' && !isLast) { e.preventDefault(); onMoveDown(); }
                if (e.key === 'd' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onDuplicate(component.id); }
            }}
        >
            {showControls && (
                <div className="eui-rb-design-comp-type-label" aria-hidden="true">
                    {typeLabels[component.type] ?? component.type}
                </div>
            )}

            <div className="eui-rb-design-comp-content">
                {renderDesignContent(component, onContainerDrop, selectedId, onSelectNested, onDeleteNested, onDuplicateNested)}
            </div>

            {showControls && (
                <div className="eui-rb-design-comp-toolbar" role="toolbar" aria-label={`${typeLabels[component.type]} actions`}>
                    <button
                        className="eui-rb-design-comp-toolbar-btn"
                        onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                        disabled={isFirst}
                        title="Move up"
                        aria-label="Move component up"
                    >
                        <ArrowUpIcon aria-hidden="true" />
                    </button>
                    <button
                        className="eui-rb-design-comp-toolbar-btn"
                        onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                        disabled={isLast}
                        title="Move down"
                        aria-label="Move component down"
                    >
                        <ArrowDownIcon aria-hidden="true" />
                    </button>
                    <div className="eui-rb-design-comp-toolbar-divider" />
                    <button
                        className="eui-rb-design-comp-toolbar-btn"
                        onClick={(e) => { e.stopPropagation(); onDuplicate(component.id); }}
                        title="Duplicate"
                        aria-label="Duplicate component"
                    >
                        <CopyIcon aria-hidden="true" />
                    </button>
                    <button
                        className="eui-rb-design-comp-toolbar-btn danger"
                        onClick={(e) => { e.stopPropagation(); onDelete(component.id); }}
                        title="Delete"
                        aria-label="Delete component"
                    >
                        <TrashIcon aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
};
