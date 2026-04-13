import React from 'react';
import Table from '../../../components/table/Table';
import { Column } from '../../../components/table/table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleUsers, User } from './table-story-data';

const customColumns: Column[] = [
    { title: 'ID', field: 'id', sortable: true, cellClassName: 'font-mono text-gray-500' },
    { title: 'Name', field: 'name', sortable: true, cellClassName: 'font-semibold' },
    { title: 'Email', field: 'email', sortable: true },
    {
        title: 'Status',
        field: 'status',
        sortable: true,
        template: (row: User) => (
            <span
                className={`px-2 py-1 rounded text-xs ${
                    row.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
            >
                {row.status}
            </span>
        ),
    },
    { title: 'Join Date', field: 'joinDate', sortable: true },
];

const code = `{
  title: 'Status',
  field: 'status',
  template: (row) => (
    <span className={row.status === 'active' ? 'badge-green' : 'badge-red'}>
      {row.status}
    </span>
  ),
}`;

const CustomRendering: React.FC = () => (
    <>
        <ComponentDemo title="Table with Custom Templates" description="Custom cell rendering with badges" centered={false}>
            <Table columns={customColumns} rows={sampleUsers} totalRows={sampleUsers.length} pagination={false} />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default CustomRendering;
