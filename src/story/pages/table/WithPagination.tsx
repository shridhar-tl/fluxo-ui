import React from 'react';
import Table from '../../../components/table/Table';
import { Column } from '../../../components/table/table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleUsers, User } from './table-story-data';

const columns: Column[] = [
    { title: 'ID', field: 'id', sortable: true },
    { title: 'Name', field: 'name', sortable: true },
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

const code = `<Table
  columns={columns}
  rows={data}
  totalRows={data.length}
  rowsPerPage={5}
  rowCounts={[5, 10, 15]}
  onChange={(params) => console.log(params)}
/>`;

const WithPagination: React.FC = () => (
    <>
        <ComponentDemo title="Table with Pagination" centered={false}>
            <Table
                columns={columns}
                rows={sampleUsers}
                totalRows={sampleUsers.length}
                rowsPerPage={5}
                rowCounts={[5, 10, 15]}
                onChange={(params) => console.log('Table changed:', params)}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default WithPagination;
