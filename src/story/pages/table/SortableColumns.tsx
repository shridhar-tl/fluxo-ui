import React from 'react';
import Table from '../../../components/table/Table';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicColumns, sampleUsers } from './table-story-data';

const code = `<Table
  columns={columns}
  rows={data}
  totalRows={data.length}
  onSort={(column, asc) => console.log('Sort by:', column.field, asc)}
  pagination={false}
/>`;

const SortableColumns: React.FC = () => (
    <>
        <ComponentDemo title="Table with Sorting" description="Click column headers to sort" centered={false}>
            <Table
                columns={basicColumns}
                rows={sampleUsers}
                totalRows={sampleUsers.length}
                onSort={(col, asc) => console.log('Sort:', col.field, asc)}
                pagination={false}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default SortableColumns;
