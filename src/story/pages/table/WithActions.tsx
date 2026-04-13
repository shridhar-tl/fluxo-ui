import React from 'react';
import { Button } from '../../../components';
import Table from '../../../components/table/Table';
import { Column } from '../../../components/table/table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleUsers, User } from './table-story-data';

const columnsWithActions: Column[] = [
    { title: 'Name', field: 'name', sortable: true },
    { title: 'Email', field: 'email', sortable: true },
    { title: 'Role', field: 'role', sortable: true },
    {
        title: 'Actions',
        field: 'id',
        template: (row: User) => (
            <div className="flex gap-2">
                <Button size="xs" variant="primary" onClick={(e) => { e.stopPropagation(); alert(`Edit ${row.name}`); }}>
                    Edit
                </Button>
                <Button size="xs" variant="danger" layout="outlined" onClick={(e) => { e.stopPropagation(); alert(`Delete ${row.name}`); }}>
                    Delete
                </Button>
            </div>
        ),
    },
];

const code = `{
  title: 'Actions',
  field: 'id',
  template: (row) => (
    <div className="flex gap-2">
      <Button size="xs" variant="primary" onClick={() => handleEdit(row)}>Edit</Button>
      <Button size="xs" variant="danger" layout="outlined" onClick={() => handleDelete(row)}>Delete</Button>
    </div>
  ),
}`;

const WithActions: React.FC = () => (
    <>
        <ComponentDemo title="Table with Row Actions" centered={false}>
            <Table columns={columnsWithActions} rows={sampleUsers.slice(0, 5)} totalRows={5} pagination={false} />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default WithActions;
