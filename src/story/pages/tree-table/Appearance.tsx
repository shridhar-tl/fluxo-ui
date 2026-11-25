import React, { useState } from 'react';

import { InputSwitch, SelectButton, TreeTable } from '../../../components';
import type { TreeTableColumn, TreeTableGridLines, TreeTableSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowStyle, stackStyle } from '../../demo-styles';
import { type FileNode, fileTree, formatBytes } from './tree-table-story-data';

const columns: TreeTableColumn<FileNode>[] = [
    { key: 'name', title: 'Name', minWidth: 220 },
    { key: 'size', title: 'Size', width: 120, align: 'right', format: formatBytes, aggregate: 'sum' },
    { key: 'modified', title: 'Modified', width: 140, hideBelow: 'sm' },
];

const sizeItems = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
];

const lineItems = [
    { label: 'None', value: 'none' },
    { label: 'Rows', value: 'horizontal' },
    { label: 'Columns', value: 'vertical' },
    { label: 'Both', value: 'both' },
];

const code = `<TreeTable
    data={files}
    columns={columns}
    size="sm"
    gridLines="both"
    striped
    showGuides
    indent={24}
    expandOnRowClick
/>`;

const Appearance: React.FC = () => {
    const [size, setSize] = useState<TreeTableSize>('md');
    const [lines, setLines] = useState<TreeTableGridLines>('horizontal');
    const [striped, setStriped] = useState(false);
    const [guides, setGuides] = useState(true);
    const [rowToggle, setRowToggle] = useState(true);

    return (
        <>
            <ComponentDemo title="Density, Lines & Guides" description="Adjust row density, cell borders, striping and tree guide lines. With expandOnRowClick, clicking anywhere on a parent row toggles it.">
                <div style={stackStyle}>
                    <div style={{ ...rowStyle, gap: '1rem' }}>
                        <SelectButton items={sizeItems} value={size} onChange={(event) => setSize(event.value as TreeTableSize)} ariaLabel="Row density" />
                        <SelectButton items={lineItems} value={lines} onChange={(event) => setLines(event.value as TreeTableGridLines)} ariaLabel="Grid lines" />
                    </div>
                    <div style={{ ...rowStyle, gap: '1.25rem' }}>
                        <InputSwitch label="Striped" checked={striped} onChange={(event) => setStriped(Boolean(event.value))} />
                        <InputSwitch label="Guide lines" checked={guides} onChange={(event) => setGuides(Boolean(event.value))} />
                        <InputSwitch label="Expand on row click" checked={rowToggle} onChange={(event) => setRowToggle(Boolean(event.value))} />
                    </div>
                    <TreeTable<FileNode>
                        data={fileTree}
                        columns={columns}
                        size={size}
                        gridLines={lines}
                        striped={striped}
                        showGuides={guides}
                        expandOnRowClick={rowToggle}
                        indent={24}
                        defaultExpandAll
                        height={360}
                        ariaLabel="Files"
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Appearance;
