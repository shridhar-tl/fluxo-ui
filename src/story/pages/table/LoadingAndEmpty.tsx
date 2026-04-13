import React, { useState } from 'react';
import { Button } from '../../../components';
import Table from '../../../components/table/Table';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicColumns, sampleUsers } from './table-story-data';

const loadingCode = `<Table
  columns={columns}
  rows={data}
  totalRows={data.length}
  isLoading={isLoading}
  expectedRows={5}
/>`;

const emptyCode = `<Table
  columns={columns}
  rows={[]}
  totalRows={0}
  noRowsMessage="No users found. Try adjusting your filters."
  pagination={false}
/>`;

const LoadingAndEmpty: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLoadingDemo = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <>
            <div className="space-y-6">
                <ComponentDemo title="Loading State" description="Shimmer skeleton while data loads" centered={false}>
                    <div className="space-y-4">
                        <Button onClick={handleLoadingDemo} variant="primary">Simulate Loading</Button>
                        <Table
                            columns={basicColumns}
                            rows={sampleUsers}
                            totalRows={sampleUsers.length}
                            isLoading={isLoading}
                            expectedRows={5}
                            pagination={false}
                        />
                    </div>
                </ComponentDemo>

                <ComponentDemo title="Empty State" description="Custom message when no data" centered={false}>
                    <Table
                        columns={basicColumns}
                        rows={[]}
                        totalRows={0}
                        noRowsMessage="No users found. Try adjusting your filters."
                        pagination={false}
                    />
                </ComponentDemo>
            </div>
            <div className="mt-4 space-y-4">
                <CodeBlock code={loadingCode} language="tsx" />
                <CodeBlock code={emptyCode} language="tsx" />
            </div>
        </>
    );
};

export default LoadingAndEmpty;
