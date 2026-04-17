import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import {
    AlignLeftIcon,
    BarChartIcon,
    CanvasLayoutIcon,
    ColumnsLayoutIcon,
    DonutChartIcon,
    ExternalLinkIcon,
    HeadingIcon,
    HorizontalRuleIcon,
    ImageIcon,
    LineChartUpIcon,
    PieChartIcon,
    TabViewIcon,
    TableIcon,
} from '../../../assets/icons';
import type { SVGIcon } from '../../../assets/icons';
import { TextInput } from '../../TextInput';

interface ToolboxItem {
    type: string;
    label: string;
    icon: SVGIcon;
    category: string;
}

const toolboxItems: ToolboxItem[] = [
    { type: 'header', label: 'Header', icon: HeadingIcon, category: 'Layout' },
    { type: 'text', label: 'Text', icon: AlignLeftIcon, category: 'Layout' },
    { type: 'image', label: 'Image', icon: ImageIcon, category: 'Layout' },
    { type: 'horizontal-line', label: 'Horizontal Line', icon: HorizontalRuleIcon, category: 'Layout' },
    { type: 'tab', label: 'Tab Component', icon: TabViewIcon, category: 'Layout' },
    { type: 'columns', label: 'Columns Layout', icon: ColumnsLayoutIcon, category: 'Layout' },
    { type: 'canvas', label: 'Canvas', icon: CanvasLayoutIcon, category: 'Layout' },
    { type: 'table', label: 'Table', icon: TableIcon, category: 'Data' },
    { type: 'sub-report', label: 'Sub-report', icon: ExternalLinkIcon, category: 'Data' },
    { type: 'chart-bar', label: 'Bar Chart', icon: BarChartIcon, category: 'Charts' },
    { type: 'chart-pie', label: 'Pie Chart', icon: PieChartIcon, category: 'Charts' },
    { type: 'chart-donut', label: 'Donut Chart', icon: DonutChartIcon, category: 'Charts' },
    { type: 'chart-line', label: 'Line Chart', icon: LineChartUpIcon, category: 'Charts' },
];

export const ToolboxPanel: React.FC = () => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return toolboxItems;
        return toolboxItems.filter((item) => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
    }, [search]);

    const groups = useMemo(() => {
        const map = new Map<string, ToolboxItem[]>();
        filtered.forEach((item) => {
            const list = map.get(item.category) ?? [];
            list.push(item);
            map.set(item.category, list);
        });
        return map;
    }, [filtered]);

    return (
        <div className="eui-rb-toolbox">
            <div className="eui-rb-toolbox-search">
                <TextInput
                    placeholder="Search components..."
                    value={search}
                    onChange={(e) => setSearch(e.value)}
                    aria-label="Search components"
                    size="sm"
                />
            </div>
            <div className="eui-rb-toolbox-list" role="list">
                {Array.from(groups.entries()).map(([category, items]) => (
                    <div key={category} className="eui-rb-toolbox-group">
                        <div className="eui-rb-toolbox-group-title">{category}</div>
                        {items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.type}
                                    className="eui-rb-toolbox-item"
                                    draggable
                                    role="listitem"
                                    tabIndex={0}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('application/rb-component-type', item.type);
                                        e.dataTransfer.setData(`application/rb-type-${item.type}`, '1');
                                        e.dataTransfer.effectAllowed = 'copy';
                                    }}
                                    title={`Drag to add ${item.label}`}
                                >
                                    <Icon aria-hidden="true" />
                                    {item.label}
                                </div>
                            );
                        })}
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className={classNames('eui-rb-ds-explorer-empty')}>
                        <p>No components match "{search}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};
