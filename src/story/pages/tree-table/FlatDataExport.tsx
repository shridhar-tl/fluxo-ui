import React, { useRef, useState } from 'react';

import { UserGroupIcon, UserIcon } from '../../../assets/icons';
import { Button, TreeTable } from '../../../components';
import type { TreeTableColumn, TreeTableHandle } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowStyle, stackStyle } from '../../demo-styles';
import { type EmployeeRow, employees, formatCurrency } from './tree-table-story-data';

const columns: TreeTableColumn<EmployeeRow>[] = [
    { key: 'name', title: 'Name', minWidth: 220, sortable: true },
    { key: 'title', title: 'Title', minWidth: 200, sortable: true, hideBelow: 'sm' },
    { key: 'department', title: 'Department', width: 140, sortable: true, hideBelow: 'md' },
    { key: 'salary', title: 'Salary', width: 140, align: 'right', format: formatCurrency, sortable: true, aggregateParents: false, aggregate: 'sum' },
];

const renderIcon = (_row: EmployeeRow, context: { hasChildren: boolean }) => (context.hasChildren ? <UserGroupIcon /> : <UserIcon />);

const code = `const employees = [
    { id: 1, managerId: null, name: 'Olivia Grant', salary: 320000 },
    { id: 2, managerId: 1, name: 'James Park', salary: 240000 },
];

const tableRef = useRef<TreeTableHandle<Employee>>(null);

<TreeTable ref={tableRef} data={employees} columns={columns} parentKey="managerId" defaultExpandAll />

const csv = tableRef.current?.toCsv({ allRows: true });`;

const FlatDataExport: React.FC = () => {
    const tableRef = useRef<TreeTableHandle<EmployeeRow>>(null);
    const [csv, setCsv] = useState('');

    return (
        <>
            <ComponentDemo
                title="Flat Data & CSV Export"
                description="Pass a flat list with a parent key and the tree is built for you. toCsv() exports the visible rows or the whole tree, escaping cells that spreadsheets could run as formulas."
            >
                <div style={stackStyle}>
                    <TreeTable<EmployeeRow>
                        ref={tableRef}
                        data={employees}
                        columns={columns}
                        parentKey="managerId"
                        defaultExpandAll
                        showGuides
                        rowIcon={renderIcon}
                        showFooter
                        height={380}
                        ariaLabel="Organization chart"
                    />
                    <div style={rowStyle}>
                        <Button size="sm" variant="primary" onClick={() => setCsv(tableRef.current?.toCsv() ?? '')}>
                            Export visible rows
                        </Button>
                        <Button size="sm" layout="outlined" onClick={() => setCsv(tableRef.current?.toCsv({ allRows: true }) ?? '')}>
                            Export all rows
                        </Button>
                    </div>
                    {csv && <CodeBlock code={csv} language="text" />}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default FlatDataExport;
