import React, { useState } from 'react';

import { Dropdown, SelectButton, TextInput, TreeTable } from '../../../components';
import type { TreeTableColumn, TreeTableFilterMode, TreeTableSort } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowStyle, stackStyle } from '../../demo-styles';
import { formatCurrency, type ProjectNode, projectTree } from './tree-table-story-data';

const statusOptions = [
    { label: 'Any status', value: '' },
    { label: 'Planned', value: 'Planned' },
    { label: 'Active', value: 'Active' },
    { label: 'Blocked', value: 'Blocked' },
    { label: 'Done', value: 'Done' },
];

const columns: TreeTableColumn<ProjectNode>[] = [
    { key: 'name', title: 'Project', minWidth: 220, sortable: true, filterable: true },
    { key: 'owner', title: 'Owner', width: 160, sortable: true, filterable: true },
    {
        key: 'status',
        title: 'Status',
        width: 170,
        sortable: true,
        filterFn: (value, _row, filterValue) => value === filterValue,
        filter: ({ value, onChange, ariaLabel }) => (
            <Dropdown size="sm" options={statusOptions} value={value} onChange={(event) => onChange(String(event.value ?? ''))} ariaLabel={ariaLabel} />
        ),
    },
    { key: 'region', title: 'Region', width: 120, sortable: true, filterable: true, hideBelow: 'md' },
    { key: 'budget', title: 'Budget', width: 130, align: 'right', sortable: true, aggregate: 'sum', format: formatCurrency, globalFilter: false },
];

const modeItems = [
    { label: 'Lenient', value: 'lenient' },
    { label: 'Strict', value: 'strict' },
];

const code = `<TextInput value={search} onChange={(e) => setSearch(e.value)} placeholder="Search…" />

<TreeTable
    data={projects}
    columns={[
        { key: 'name', title: 'Project', sortable: true, filterable: true },
        { key: 'status', title: 'Status', sortable: true, filterFn: (value, row, term) => value === term,
          filter: ({ value, onChange, ariaLabel }) => <Dropdown options={statuses} value={value} onChange={(e) => onChange(e.value)} ariaLabel={ariaLabel} /> },
        { key: 'budget', title: 'Budget', sortable: true, aggregate: 'sum', globalFilter: false },
    ]}
    filterText={search}
    filterMode="lenient"
    showFilterRow
    defaultSort={[{ key: 'budget', direction: 'desc' }]}
/>`;

const SortFilter: React.FC = () => {
    const [search, setSearch] = useState('');
    const [mode, setMode] = useState<TreeTableFilterMode>('lenient');
    const [sort, setSort] = useState<TreeTableSort[]>([{ key: 'budget', direction: 'desc' }]);

    return (
        <>
            <ComponentDemo
                title="Sorting & Filtering"
                description="Siblings sort within their parent. Shift + click a header to add a secondary sort. Matches keep their ancestors visible and expanded; lenient mode also keeps a match's children."
            >
                <div style={stackStyle}>
                    <div style={{ ...rowStyle, gap: '1rem' }}>
                        <div style={{ flex: '1 1 240px', maxWidth: 360 }}>
                            <TextInput value={search} onChange={(event) => setSearch(event.value)} placeholder="Search all columns…" aria-label="Search projects" clearable onClear={() => setSearch('')} />
                        </div>
                        <SelectButton items={modeItems} value={mode} onChange={(event) => setMode(event.value as TreeTableFilterMode)} ariaLabel="Filter mode" />
                    </div>
                    <TreeTable<ProjectNode>
                        data={projectTree}
                        columns={columns}
                        filterText={search}
                        filterMode={mode}
                        showFilterRow
                        sort={sort}
                        onSortChange={setSort}
                        defaultExpandLevel={1}
                        height={420}
                        ariaLabel="Filterable projects"
                    />
                    <div style={readoutStyle} aria-live="polite">
                        {sort.length ? `Sorted by ${sort.map((entry) => `${entry.key} (${entry.direction})`).join(', ')}` : 'Unsorted'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default SortFilter;
