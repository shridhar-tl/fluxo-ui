import { EditIcon, TrashIcon, CopyIcon, InfoIcon, DownloadIcon, CheckCircleIcon } from '../../../assets/icons';
import type { Column } from '../../../components/table/table-types';

export const basicMenuItems = [
    { label: 'Edit', icon: <EditIcon className="w-4 h-4" />, command: () => console.log('Edit') },
    { label: 'Duplicate', icon: <CopyIcon className="w-4 h-4" />, command: () => console.log('Duplicate') },
    { seperator: true },
    { label: 'Download', icon: <DownloadIcon className="w-4 h-4" />, command: () => console.log('Download') },
    { seperator: true },
    { label: 'Delete', icon: <TrashIcon className="w-4 h-4" />, command: () => console.log('Delete') },
];

export const longMenuItems = [
    { label: 'Dashboard Overview', icon: <InfoIcon className="w-4 h-4" />, command: () => console.log('Dashboard') },
    { label: 'Analytics & Reports', icon: <InfoIcon className="w-4 h-4" />, command: () => console.log('Analytics') },
    { label: 'User Management', icon: <EditIcon className="w-4 h-4" />, command: () => console.log('Users') },
    { label: 'Role & Permission Settings', icon: <EditIcon className="w-4 h-4" />, command: () => console.log('Roles') },
    { seperator: true },
    { label: 'Import Data', icon: <DownloadIcon className="w-4 h-4" />, command: () => console.log('Import') },
    { label: 'Export All Records as CSV', icon: <DownloadIcon className="w-4 h-4" />, command: () => console.log('Export CSV') },
    { label: 'Export All Records as PDF', icon: <DownloadIcon className="w-4 h-4" />, command: () => console.log('Export PDF') },
    { seperator: true },
    { label: 'Archive Selected Items', icon: <CopyIcon className="w-4 h-4" />, command: () => console.log('Archive') },
    { label: 'Duplicate & Create Copy', icon: <CopyIcon className="w-4 h-4" />, command: () => console.log('Duplicate') },
    { label: 'Move to Another Folder or Workspace', icon: <EditIcon className="w-4 h-4" />, command: () => console.log('Move') },
    { seperator: true },
    { label: 'Share with Team Members', icon: <CheckCircleIcon className="w-4 h-4" />, command: () => console.log('Share') },
    { label: 'Publish to Public', icon: <CheckCircleIcon className="w-4 h-4" />, command: () => console.log('Publish') },
    { label: 'Schedule for Later', icon: <InfoIcon className="w-4 h-4" />, command: () => console.log('Schedule') },
    { seperator: true },
    { label: 'View Audit Log', icon: <InfoIcon className="w-4 h-4" />, command: () => console.log('Audit') },
    { label: 'Delete Permanently', icon: <TrashIcon className="w-4 h-4" />, command: () => console.log('Delete') },
];

export const nestedMenuItems = [
    { label: 'View Details', icon: <InfoIcon className="w-4 h-4" />, command: () => console.log('View Details') },
    {
        label: 'Export',
        icon: <DownloadIcon className="w-4 h-4" />,
        items: [
            { label: 'Export as CSV', command: () => console.log('CSV') },
            { label: 'Export as PDF', command: () => console.log('PDF') },
            { label: 'Export as JSON', command: () => console.log('JSON') },
        ],
    },
    { seperator: true },
    { label: 'Mark as Done', icon: <CheckCircleIcon className="w-4 h-4" />, command: () => console.log('Done') },
    { seperator: true },
    { label: 'Delete', icon: <TrashIcon className="w-4 h-4" />, command: () => console.log('Delete') },
];

export const tableRows = [
    { id: 1, name: 'Alice Johnson', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Bob Smith', role: 'Editor', status: 'Active' },
    { id: 3, name: 'Carol White', role: 'Viewer', status: 'Inactive' },
];

export const tableColumns: Column[] = [
    { title: 'Name', field: 'name' },
    { title: 'Role', field: 'role' },
    { title: 'Status', field: 'status' },
];
