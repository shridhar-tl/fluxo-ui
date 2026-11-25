import React, { useMemo, useState } from 'react';

import { InputSwitch, SelectButton, TreeTable } from '../../../components';
import type { TreeTableColumn, TreeTableKey, TreeTableSelectionMode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowStyle, stackStyle } from '../../demo-styles';
import { type ProjectNode, projectTree } from './tree-table-story-data';

const columns: TreeTableColumn<ProjectNode>[] = [
    { key: 'name', title: 'Project', minWidth: 240 },
    { key: 'owner', title: 'Owner', width: 160, hideBelow: 'sm' },
    { key: 'status', title: 'Status', width: 120 },
];

const modeItems = [
    { label: 'Single', value: 'single' },
    { label: 'Multiple', value: 'multiple' },
    { label: 'Checkbox', value: 'checkbox' },
];

const isBlocked = (row: ProjectNode) => row.status === 'Blocked';

const collectNames = (nodes: ProjectNode[], keys: ReadonlySet<TreeTableKey>, out: string[] = []): string[] => {
    nodes.forEach((node) => {
        if (keys.has(node.id)) out.push(node.name);
        if (node.children) collectNames(node.children, keys, out);
    });
    return out;
};

const code = `const [selected, setSelected] = useState<Set<TreeTableKey>>(new Set());

<TreeTable
    data={projects}
    columns={columns}
    selectionMode="checkbox"
    propagateSelection
    selectedKeys={selected}
    onSelectionChange={(keys) => setSelected(keys)}
    isRowDisabled={(row) => row.status === 'Blocked'}
/>`;

const Selection: React.FC = () => {
    const [mode, setMode] = useState<TreeTableSelectionMode>('checkbox');
    const [propagate, setPropagate] = useState(true);
    const [selected, setSelected] = useState<Set<TreeTableKey>>(() => new Set(['p1-1-1']));

    const names = useMemo(() => collectNames(projectTree, selected), [selected]);

    return (
        <>
            <ComponentDemo
                title="Single, Multiple & Checkbox Selection"
                description="Multiple mode supports Ctrl/Cmd + click, Shift + click and Shift + Arrow keys. Checkbox mode cascades to children and shows a mixed state on parents. Press Space to toggle the focused row and Ctrl + A to select all. Blocked projects are disabled."
            >
                <div style={stackStyle}>
                    <div style={{ ...rowStyle, gap: '1rem' }}>
                        <SelectButton
                            items={modeItems}
                            value={mode}
                            onChange={(event) => {
                                setMode(event.value as TreeTableSelectionMode);
                                setSelected(new Set());
                            }}
                            ariaLabel="Selection mode"
                        />
                        <InputSwitch
                            label="Cascade to children"
                            checked={propagate}
                            disabled={mode !== 'checkbox'}
                            onChange={(event) => setPropagate(Boolean(event.value))}
                        />
                    </div>
                    <TreeTable<ProjectNode>
                        data={projectTree}
                        columns={columns}
                        selectionMode={mode}
                        propagateSelection={propagate}
                        selectedKeys={selected}
                        onSelectionChange={(keys) => setSelected(keys)}
                        isRowDisabled={isBlocked}
                        defaultExpandAll
                        height={380}
                        ariaLabel="Projects"
                    />
                    <div style={readoutStyle} aria-live="polite">
                        {names.length ? `Selected (${names.length}): ${names.join(', ')}` : 'Nothing selected.'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Selection;
