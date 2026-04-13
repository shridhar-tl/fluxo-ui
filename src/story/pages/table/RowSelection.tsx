import React, { useState } from 'react';
import Table from '../../../components/table/Table';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicColumns, sampleUsers, User } from './table-story-data';

const code = `<Table
  columns={columns}
  rows={data}
  totalRows={data.length}
  onRowClick={({ row }) => setSelectedRow(row)}
  pagination={false}
/>`;

const RowSelection: React.FC = () => {
    const [selectedRow, setSelectedRow] = useState<User | null>(null);

    return (
        <>
            <ComponentDemo title="Table with Row Click" centered={false}>
                <div className="space-y-4">
                    <Table
                        columns={basicColumns}
                        rows={sampleUsers.slice(0, 5)}
                        totalRows={5}
                        pagination={false}
                        onRowClick={({ row }) => setSelectedRow(row)}
                    />
                    {selectedRow && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-700">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                Selected: {selectedRow.name} ({selectedRow.email})
                            </p>
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default RowSelection;
