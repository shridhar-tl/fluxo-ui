import React from 'react';
import { showContextMenu, Table } from '../../../components';
import { EditIcon, TrashIcon, CopyIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { tableRows, tableColumns } from './context-menu-story-data';

const TableRowMenu: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Per-row actions" description="Right-click on any row to see row-specific actions." centered={false}>
                <div
                    className="w-full cursor-context-menu"
                    onContextMenu={(e) => {
                        const tr = (e.target as HTMLElement).closest('tbody tr');
                        if (!tr || !tr.parentElement) return;
                        const rowIndex = Array.from(tr.parentElement.children).indexOf(tr);
                        const row = tableRows[rowIndex];
                        if (!row) return;
                        showContextMenu(e, [
                            { label: `Edit ${row.name}`, icon: <EditIcon className="w-4 h-4" />, command: () => console.log('Edit', row.id) },
                            { label: 'Duplicate', icon: <CopyIcon className="w-4 h-4" />, command: () => console.log('Dup', row.id) },
                            { seperator: true },
                            { label: 'Delete', icon: <TrashIcon className="w-4 h-4" />, command: () => console.log('Del', row.id) },
                        ]);
                    }}
                >
                    <Table
                        columns={tableColumns}
                        rows={tableRows}
                        totalRows={tableRows.length}
                        pagination={false}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`rows.map((row) => (
  <tr
    key={row.id}
    onContextMenu={(e) =>
      showContextMenu(e, [
        { label: \`Edit \${row.name}\`, icon: <EditIcon />, command: () => handleEdit(row.id) },
        { seperator: true },
        { label: 'Delete', icon: <TrashIcon />, command: () => handleDelete(row.id) },
      ])
    }
  >
    ...
  </tr>
))`}
                />
            </div>
        </>
    );
};

export default TableRowMenu;
