export interface JiraIssue {
    id: string;
    key: string;
    summary: string;
    status: string;
    priority: string;
    assignee: string;
    reporter: string;
    created: string;
    updated: string;
    storyPoints?: number;
    subtasks: JiraSubtask[];
    comments: JiraComment[];
}

export interface JiraSubtask {
    id: string;
    key: string;
    summary: string;
    status: string;
    assignee: string;
}

export interface JiraComment {
    id: string;
    author: string;
    body: string;
    created: string;
}

export const jiraSampleData: JiraIssue[] = [
    {
        id: '10001',
        key: 'PROJ-1',
        summary: 'Implement user authentication',
        status: 'Done',
        priority: 'High',
        assignee: 'Alice Johnson',
        reporter: 'Bob Smith',
        created: '2024-01-10',
        updated: '2024-01-20',
        storyPoints: 8,
        subtasks: [
            { id: '10011', key: 'PROJ-11', summary: 'Set up JWT middleware', status: 'Done', assignee: 'Alice Johnson' },
            { id: '10012', key: 'PROJ-12', summary: 'Build login page', status: 'Done', assignee: 'Carol White' },
        ],
        comments: [
            { id: 'c1', author: 'Bob Smith', body: 'Looks good, please add rate limiting.', created: '2024-01-15' },
            { id: 'c2', author: 'Alice Johnson', body: 'Rate limiting added in the last commit.', created: '2024-01-16' },
        ],
    },
    {
        id: '10002',
        key: 'PROJ-2',
        summary: 'Dashboard analytics widgets',
        status: 'In Progress',
        priority: 'Medium',
        assignee: 'David Lee',
        reporter: 'Alice Johnson',
        created: '2024-01-12',
        updated: '2024-01-22',
        storyPoints: 13,
        subtasks: [
            { id: '10021', key: 'PROJ-21', summary: 'Line chart for revenue', status: 'Done', assignee: 'David Lee' },
            { id: '10022', key: 'PROJ-22', summary: 'Pie chart for categories', status: 'In Progress', assignee: 'Eve Brown' },
            { id: '10023', key: 'PROJ-23', summary: 'KPI cards row', status: 'To Do', assignee: 'David Lee' },
        ],
        comments: [
            { id: 'c3', author: 'Alice Johnson', body: 'Make sure charts are responsive on mobile.', created: '2024-01-18' },
        ],
    },
    {
        id: '10003',
        key: 'PROJ-3',
        summary: 'API rate limiting and throttling',
        status: 'To Do',
        priority: 'High',
        assignee: 'Frank Martinez',
        reporter: 'David Lee',
        created: '2024-01-14',
        updated: '2024-01-14',
        storyPoints: 5,
        subtasks: [],
        comments: [],
    },
    {
        id: '10004',
        key: 'PROJ-4',
        summary: 'Email notification system',
        status: 'In Progress',
        priority: 'Low',
        assignee: 'Carol White',
        reporter: 'Frank Martinez',
        created: '2024-01-08',
        updated: '2024-01-21',
        storyPoints: 3,
        subtasks: [
            { id: '10041', key: 'PROJ-41', summary: 'Email template design', status: 'Done', assignee: 'Carol White' },
            { id: '10042', key: 'PROJ-42', summary: 'SMTP integration', status: 'In Progress', assignee: 'Carol White' },
        ],
        comments: [
            { id: 'c4', author: 'Frank Martinez', body: 'Use SendGrid for reliable delivery.', created: '2024-01-09' },
            { id: 'c5', author: 'Carol White', body: 'Switched to SendGrid as suggested.', created: '2024-01-17' },
        ],
    },
    {
        id: '10005',
        key: 'PROJ-5',
        summary: 'Mobile responsiveness overhaul',
        status: 'Done',
        priority: 'Critical',
        assignee: 'Eve Brown',
        reporter: 'Carol White',
        created: '2024-01-05',
        updated: '2024-01-19',
        storyPoints: 21,
        subtasks: [
            { id: '10051', key: 'PROJ-51', summary: 'Fix navigation on small screens', status: 'Done', assignee: 'Eve Brown' },
            { id: '10052', key: 'PROJ-52', summary: 'Touch-friendly date picker', status: 'Done', assignee: 'David Lee' },
            { id: '10053', key: 'PROJ-53', summary: 'Responsive table layout', status: 'Done', assignee: 'Eve Brown' },
        ],
        comments: [],
    },
];
