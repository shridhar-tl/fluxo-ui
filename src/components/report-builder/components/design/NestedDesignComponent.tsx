import classNames from 'classnames';
import React, { useState } from 'react';
import { CopyIcon, TrashIcon } from '../../../../assets/icons';
import type { ReportComponent } from '../../report-definition-types';
import { ChartDesign } from './ChartDesign';
import { HeaderDesign } from './HeaderDesign';
import { TextDesign } from './TextDesign';
import { ImageDesign } from './ImageDesign';
import { HorizontalLineDesign } from './HorizontalLineDesign';
import { TableDesign } from './TableDesign';
import { SubReportDesign } from './SubReportDesign';

interface NestedDesignComponentProps {
    component: ReportComponent;
    index: number;
    containerId: string;
    selected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}

const typeLabels: Record<string, string> = {
    header: 'Header',
    text: 'Text',
    image: 'Image',
    'horizontal-line': 'H. Line',
    table: 'Table',
    'sub-report': 'Sub-report',
    'chart-bar': 'Bar Chart',
    'chart-pie': 'Pie Chart',
    'chart-donut': 'Donut Chart',
    'chart-line': 'Line Chart',
    repeater: 'Repeater',
    columns: 'Columns',
    tab: 'Tabs',
};

function renderNestedContent(comp: ReportComponent): React.ReactNode {
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
            return (
                <div style={{ padding: '8px', color: 'var(--eui-text-muted)', fontSize: 11, fontStyle: 'italic' }}>
                    {typeLabels[comp.type] ?? comp.type}
                </div>
            );
    }
}

export const NestedDesignComponent: React.FC<NestedDesignComponentProps> = ({
    component,
    index,
    containerId,
    selected,
    onSelect,
    onDelete,
    onDuplicate,
}) => {
    const [hovered, setHovered] = useState(false);
    const showControls = selected || hovered;

    return (
        <div
            className={classNames('eui-rb-design-comp nested', { selected, hovered })}
            onClick={(e) => { e.stopPropagation(); onSelect(component.id); }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData(
                    'application/rb-component-move-nested',
                    JSON.stringify({ id: component.id, fromIndex: index, containerId }),
                );
                e.dataTransfer.setData(`application/rb-type-${component.type}`, '1');
                e.dataTransfer.effectAllowed = 'move';
            }}
            role="treeitem"
            aria-selected={selected}
            aria-label={`${typeLabels[component.type] ?? component.type} component`}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(component.id); }
                if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(component.id); }
                if (e.key === 'd' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onDuplicate(component.id); }
            }}
        >
            {showControls && (
                <div className="eui-rb-design-comp-type-label" aria-hidden="true">
                    {typeLabels[component.type] ?? component.type}
                </div>
            )}
            <div className="eui-rb-design-comp-content">
                {renderNestedContent(component)}
            </div>
            {showControls && (
                <div className="eui-rb-design-comp-toolbar" role="toolbar" aria-label={`${typeLabels[component.type] ?? component.type} actions`}>
                    <button
                        className="eui-rb-design-comp-toolbar-btn"
                        onClick={(e) => { e.stopPropagation(); onDuplicate(component.id); }}
                        title="Duplicate"
                        aria-label="Duplicate"
                    >
                        <CopyIcon aria-hidden="true" />
                    </button>
                    <button
                        className="eui-rb-design-comp-toolbar-btn danger"
                        onClick={(e) => { e.stopPropagation(); onDelete(component.id); }}
                        title="Delete"
                        aria-label="Delete"
                    >
                        <TrashIcon aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
};
