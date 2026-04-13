import { Column } from '../../../components/table/table-types';

export type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    joinDate: string;
    department: string;
};

export const sampleUsers: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active', joinDate: '2023-01-15', department: 'Engineering' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Developer', status: 'active', joinDate: '2023-03-22', department: 'Engineering' },
    { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Designer', status: 'active', joinDate: '2023-02-10', department: 'Design' },
    { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Manager', status: 'inactive', joinDate: '2022-11-05', department: 'Operations' },
    { id: 5, name: 'Emma Davis', email: 'emma@example.com', role: 'Developer', status: 'active', joinDate: '2023-04-18', department: 'Engineering' },
    { id: 6, name: 'Frank Wilson', email: 'frank@example.com', role: 'Analyst', status: 'active', joinDate: '2023-05-30', department: 'Analytics' },
    { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Developer', status: 'active', joinDate: '2023-06-12', department: 'Engineering' },
    { id: 8, name: 'Henry Taylor', email: 'henry@example.com', role: 'Designer', status: 'inactive', joinDate: '2022-09-25', department: 'Design' },
];

export const basicColumns: Column[] = [
    { title: 'ID', field: 'id', sortable: true },
    { title: 'Name', field: 'name', sortable: true },
    { title: 'Email', field: 'email', sortable: true },
    { title: 'Role', field: 'role', sortable: true },
];

export const fullColumns: Column[] = [
    { title: 'ID', field: 'id', sortable: true },
    { title: 'Name', field: 'name', sortable: true },
    { title: 'Email', field: 'email', sortable: true },
    { title: 'Role', field: 'role', sortable: true },
    { title: 'Department', field: 'department', sortable: true },
    { title: 'Join Date', field: 'joinDate', sortable: true },
];
