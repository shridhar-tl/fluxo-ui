import React from 'react';
import Table from '../../../components/table/Table';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicColumns, sampleUsers } from './table-story-data';

const code = `import { Table } from 'ether-ui';

const columns = [
  { title: 'ID', field: 'id', sortable: true },
  { title: 'Name', field: 'name', sortable: true },
  { title: 'Email', field: 'email', sortable: true },
  { title: 'Role', field: 'role', sortable: true },
];

<Table columns={columns} rows={data} totalRows={data.length} pagination={false} />`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Basic Table" centered={false}>
            <Table columns={basicColumns} rows={sampleUsers.slice(0, 5)} totalRows={5} pagination={false} />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
