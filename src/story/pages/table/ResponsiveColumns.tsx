import React from 'react';
import Table from '../../../components/table/Table';
import { Column } from '../../../components/table/table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleUsers } from './table-story-data';

const responsiveColumns: Column[] = [
    { title: 'ID', field: 'id', sortable: true },
    { title: 'Name', field: 'name', sortable: true },
    { title: 'Email', field: 'email', sortable: true, hideBelow: 'md' },
    { title: 'Role', field: 'role', sortable: true, hideBelow: 'sm' },
    { title: 'Department', field: 'department', sortable: true, hideBelow: 'lg' },
    { title: 'Join Date', field: 'joinDate', sortable: true, hideBelow: 'xl' },
];

const code = `const columns = [
  { title: 'ID', field: 'id' },
  { title: 'Name', field: 'name' },
  { title: 'Email', field: 'email', hideBelow: 'md' },
  { title: 'Role', field: 'role', hideBelow: 'sm' },
  { title: 'Department', field: 'department', hideBelow: 'lg' },
  { title: 'Join Date', field: 'joinDate', hideBelow: 'xl' },
];`;

const ResponsiveColumns: React.FC = () => (
    <>
        <ComponentDemo title="Responsive Columns" description="Resize the browser to see columns hide at breakpoints" centered={false}>
            <Table columns={responsiveColumns} rows={sampleUsers} totalRows={sampleUsers.length} rowsPerPage={5} />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ResponsiveColumns;
