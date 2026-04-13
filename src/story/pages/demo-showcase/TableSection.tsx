import React, { useState } from 'react';
import { Button } from '../../../components';
import Table from '../../../components/table/Table';
import { Column } from '../../../components/table/table-types';
import { showSnackbar } from '../../../components/snackbar';
import { Size } from '../../../types';

type Employee = {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    status: 'active' | 'inactive' | 'pending';
    joinDate: string;
    salary: number;
};

const employees: Employee[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Senior Engineer', department: 'Engineering', status: 'active', joinDate: '2022-01-15', salary: 125000 },
    { id: 2, name: 'Bob Smith', email: 'bob@company.com', role: 'Product Designer', department: 'Design', status: 'active', joinDate: '2022-03-22', salary: 110000 },
    { id: 3, name: 'Carol White', email: 'carol@company.com', role: 'Marketing Lead', department: 'Marketing', status: 'active', joinDate: '2021-11-05', salary: 105000 },
    { id: 4, name: 'David Brown', email: 'david@company.com', role: 'DevOps Engineer', department: 'Engineering', status: 'inactive', joinDate: '2023-02-10', salary: 115000 },
    { id: 5, name: 'Emma Davis', email: 'emma@company.com', role: 'Sales Manager', department: 'Sales', status: 'active', joinDate: '2022-06-18', salary: 95000 },
    { id: 6, name: 'Frank Wilson', email: 'frank@company.com', role: 'Data Analyst', department: 'Analytics', status: 'pending', joinDate: '2023-09-01', salary: 90000 },
    { id: 7, name: 'Grace Lee', email: 'grace@company.com', role: 'Frontend Engineer', department: 'Engineering', status: 'active', joinDate: '2023-04-12', salary: 108000 },
    { id: 8, name: 'Henry Taylor', email: 'henry@company.com', role: 'UX Researcher', department: 'Design', status: 'active', joinDate: '2022-08-25', salary: 98000 },
    { id: 9, name: 'Ivy Chen', email: 'ivy@company.com', role: 'HR Specialist', department: 'HR', status: 'active', joinDate: '2021-05-14', salary: 85000 },
    { id: 10, name: 'Jack Martin', email: 'jack@company.com', role: 'Backend Engineer', department: 'Engineering', status: 'active', joinDate: '2023-01-30', salary: 120000 },
    { id: 11, name: 'Karen Lopez', email: 'karen@company.com', role: 'Content Strategist', department: 'Marketing', status: 'inactive', joinDate: '2022-07-19', salary: 88000 },
    { id: 12, name: 'Leo Garcia', email: 'leo@company.com', role: 'QA Engineer', department: 'Engineering', status: 'active', joinDate: '2023-06-05', salary: 95000 },
];

const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || ''}`}>{status}</span>;
};

const TableSection: React.FC<{ size?: Size }> = ({ size = 'md' }) => {
    const [selectedRow, setSelectedRow] = useState<Employee | null>(null);

    const columns: Column[] = [
        { title: 'ID', field: 'id', sortable: true },
        { title: 'Name', field: 'name', sortable: true, cellClassName: 'font-medium' },
        { title: 'Email', field: 'email', sortable: true, hideBelow: 'md' },
        { title: 'Role', field: 'role', sortable: true, hideBelow: 'lg' },
        { title: 'Department', field: 'department', sortable: true, hideBelow: 'sm' },
        {
            title: 'Status',
            field: 'status',
            sortable: true,
            template: (row: Employee) => statusBadge(row.status),
        },
        {
            title: 'Salary',
            field: 'salary',
            sortable: true,
            hideBelow: 'xl',
            template: (row: Employee) => `$${row.salary.toLocaleString()}`,
        },
        {
            title: 'Actions',
            field: 'id',
            template: (row: Employee) => (
                <div className="flex gap-1">
                    <Button
                        size="xs"
                        variant="primary"
                        layout="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                            showSnackbar(`Editing ${row.name}`, 'Edit', { type: 'info' });
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        size="xs"
                        variant="danger"
                        layout="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                            showSnackbar(`${row.name} deleted`, 'Deleted', { type: 'error' });
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <Table
                columns={columns}
                rows={employees}
                totalRows={employees.length}
                rowsPerPage={5}
                rowCounts={[5, 10, 15]}
                striped
                hoverable
                compact={size === 'xs' || size === 'sm'}
                onRowClick={({ row }) => setSelectedRow(row)}
            />
            {selectedRow && (
                <div className="p-3 rounded border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30">
                    <p className="text-sm">
                        <strong>Selected:</strong> {selectedRow.name} — {selectedRow.role} ({selectedRow.department})
                    </p>
                </div>
            )}
        </div>
    );
};

export default TableSection;
