import React from 'react';
import { ShimmerTable } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const ShimmerTableDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Table skeleton" description="Skeleton for data tables with configurable rows and columns.">
                <div className="w-full">
                    <ShimmerTable rows={4} columns={4} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import { ShimmerTable } from 'ether-ui';

{isLoading && <ShimmerTable rows={5} columns={6} showHeader />}
{!isLoading && <DataTable rows={data} columns={columns} />}`}
                />
            </div>
        </>
    );
};

export default ShimmerTableDemo;
