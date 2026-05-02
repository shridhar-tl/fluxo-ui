import React from 'react';
import Table from '../../../components/table/Table';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicColumns, fullColumns, sampleUsers } from './table-story-data';

const code = `<Table bordered columns={columns} rows={data} totalRows={data.length} pagination={false} />
<Table striped columns={columns} rows={data} totalRows={data.length} pagination={false} />
<Table compact columns={columns} rows={data} totalRows={data.length} pagination={false} />
<Table comfortable columns={columns} rows={data} totalRows={data.length} pagination={false} />
<Table borderless columns={columns} rows={data} totalRows={data.length} pagination={false} />
<Table hoverable columns={columns} rows={data} totalRows={data.length} pagination={false} />
<Table cardStyle columns={columns} rows={data} totalRows={data.length} pagination={false} />
<Table minimalHeader columns={columns} rows={data} totalRows={data.length} pagination={false} />
<Table stickyHeader maxHeight={200} columns={columns} rows={data} totalRows={data.length} pagination={false} />
<Table striped compact bordered columns={columns} rows={data} totalRows={data.length} pagination={false} />`;

const rows5 = sampleUsers.slice(0, 5);

const StyleVariants: React.FC = () => (
    <>
        <div className="space-y-6">
            <ComponentDemo title="Bordered" description="All cell borders visible" centered={false}>
                <Table bordered columns={basicColumns} rows={rows5} totalRows={5} pagination={false} />
            </ComponentDemo>

            <ComponentDemo title="Striped" description="Alternating row background colors" centered={false}>
                <Table striped columns={basicColumns} rows={sampleUsers} totalRows={sampleUsers.length} pagination={false} />
            </ComponentDemo>

            <ComponentDemo title="Compact" description="Reduced padding for dense data display" centered={false}>
                <Table compact columns={fullColumns} rows={sampleUsers} totalRows={sampleUsers.length} pagination={false} />
            </ComponentDemo>

            <ComponentDemo title="Comfortable" description="Increased padding for readability" centered={false}>
                <Table comfortable columns={basicColumns} rows={rows5} totalRows={5} pagination={false} />
            </ComponentDemo>

            <ComponentDemo title="Borderless" description="No borders or shadow for a clean look" centered={false}>
                <Table borderless columns={basicColumns} rows={rows5} totalRows={5} pagination={false} />
            </ComponentDemo>

            <ComponentDemo title="Hoverable" description="Primary-color row hover highlight" centered={false}>
                <Table hoverable columns={basicColumns} rows={rows5} totalRows={5} pagination={false} />
            </ComponentDemo>

            <ComponentDemo title="Card Style" description="Each row rendered as an individual card" centered={false}>
                <Table cardStyle columns={basicColumns} rows={rows5} totalRows={5} pagination={false} />
            </ComponentDemo>

            <ComponentDemo title="Minimal Header" description="Subtle uppercase header with no background" centered={false}>
                <Table minimalHeader columns={basicColumns} rows={rows5} totalRows={5} pagination={false} />
            </ComponentDemo>

            <ComponentDemo title="Sticky Header" description="Header stays fixed when scrolling (use the maxHeight prop to make the table itself scrollable)" centered={false}>
                <Table stickyHeader maxHeight={200} columns={basicColumns} rows={sampleUsers} totalRows={sampleUsers.length} pagination={false} />
            </ComponentDemo>

            <ComponentDemo title="Combined: Striped + Compact + Bordered" description="Multiple variants can be combined" centered={false}>
                <Table striped compact bordered columns={fullColumns} rows={sampleUsers} totalRows={sampleUsers.length} pagination={false} />
            </ComponentDemo>
        </div>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default StyleVariants;
