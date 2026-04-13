import type { GanttTask, GanttColumn, GanttMarker } from '../../../components/gantt-chart';

const today = new Date();
export const d = (offset: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return date;
};

export const basicTasks: GanttTask[] = [
    {
        id: '1',
        name: 'Project Kickoff',
        start: d(-5),
        end: d(-3),
        progress: 100,
        color: '#10b981',
        assignee: 'Alice',
    },
    {
        id: '2',
        name: 'Requirements Gathering',
        start: d(-3),
        end: d(2),
        progress: 80,
        assignee: 'Bob',
    },
    {
        id: '3',
        name: 'UI Design',
        start: d(1),
        end: d(8),
        progress: 40,
        color: '#8b5cf6',
        assignee: 'Carol',
    },
    {
        id: '4',
        name: 'Backend Development',
        start: d(3),
        end: d(15),
        progress: 20,
        color: '#f59e0b',
        assignee: 'Dave',
    },
    {
        id: '5',
        name: 'Testing & QA',
        start: d(14),
        end: d(20),
        progress: 0,
        color: '#ef4444',
        assignee: 'Eve',
    },
    {
        id: '6',
        name: 'Deployment',
        start: d(20),
        end: d(22),
        progress: 0,
        color: '#06b6d4',
        assignee: 'Alice',
    },
];

export const hierarchicalTasks: GanttTask[] = [
    {
        id: 'g1',
        name: 'Phase 1 — Discovery',
        type: 'group',
        start: d(-10),
        end: d(0),
        progress: 90,
        children: [
            { id: 'g1-1', name: 'Stakeholder Interviews', start: d(-10), end: d(-6), progress: 100, assignee: 'Alice' },
            { id: 'g1-2', name: 'Market Research', start: d(-8), end: d(-4), progress: 100, assignee: 'Bob' },
            { id: 'g1-3', name: 'Competitive Analysis', start: d(-5), end: d(0), progress: 70, assignee: 'Carol' },
        ],
    },
    {
        id: 'g2',
        name: 'Phase 2 — Design',
        type: 'group',
        start: d(0),
        end: d(14),
        progress: 35,
        children: [
            { id: 'g2-1', name: 'Wireframes', start: d(0), end: d(5), progress: 80, assignee: 'Dave' },
            { id: 'g2-2', name: 'Visual Design', start: d(4), end: d(10), progress: 20, assignee: 'Eve' },
            { id: 'g2-3', name: 'Prototyping', start: d(8), end: d(14), progress: 0, assignee: 'Alice' },
        ],
    },
    {
        id: 'g3',
        name: 'Phase 3 — Development',
        type: 'group',
        start: d(12),
        end: d(35),
        progress: 0,
        collapsed: true,
        children: [
            { id: 'g3-1', name: 'Frontend', start: d(12), end: d(28), progress: 0, assignee: 'Bob' },
            { id: 'g3-2', name: 'Backend APIs', start: d(14), end: d(30), progress: 0, assignee: 'Carol' },
            { id: 'g3-3', name: 'Database Setup', start: d(12), end: d(18), progress: 0, assignee: 'Dave' },
            { id: 'g3-4', name: 'Integration', start: d(28), end: d(35), progress: 0, assignee: 'Eve' },
        ],
    },
    {
        id: 'ms1',
        name: 'Design Review',
        type: 'milestone',
        start: d(14),
        end: d(14),
        color: '#f59e0b',
    },
    {
        id: 'ms2',
        name: 'Launch',
        type: 'milestone',
        start: d(35),
        end: d(35),
        color: '#10b981',
    },
];

export const dependencyTasks: GanttTask[] = [
    {
        id: 'd1',
        name: 'Analysis',
        start: d(-8),
        end: d(-4),
        progress: 100,
        color: '#10b981',
    },
    {
        id: 'd2',
        name: 'Design',
        start: d(-2),
        end: d(4),
        progress: 60,
        color: '#8b5cf6',
        dependencies: [{ targetId: 'd1', type: 'finish-to-start' }],
    },
    {
        id: 'd3',
        name: 'Development',
        start: d(5),
        end: d(16),
        progress: 0,
        dependencies: [{ targetId: 'd2', type: 'finish-to-start' }],
    },
    {
        id: 'd4',
        name: 'Parallel Task A',
        start: d(5),
        end: d(10),
        progress: 0,
        color: '#f59e0b',
        dependencies: [{ targetId: 'd2', type: 'finish-to-start' }],
    },
    {
        id: 'd5',
        name: 'Parallel Task B',
        start: d(8),
        end: d(14),
        progress: 0,
        color: '#06b6d4',
        dependencies: [{ targetId: 'd4', type: 'start-to-start' }],
    },
    {
        id: 'd6',
        name: 'Testing',
        start: d(16),
        end: d(22),
        progress: 0,
        color: '#ef4444',
        dependencies: [{ targetId: 'd3', type: 'finish-to-start' }, { targetId: 'd5', type: 'finish-to-start' }],
    },
];

export const markers: GanttMarker[] = [
    { id: 'm1', date: d(0), label: 'Today', color: '#3b82f6' },
    { id: 'm2', date: d(7), label: 'Sprint End', color: '#f59e0b' },
    { id: 'm3', date: d(21), label: 'Release', color: '#10b981' },
];

export const customColumns: GanttColumn[] = [
    { field: 'name', headerText: 'Task', width: 200 },
    {
        field: 'assignee',
        headerText: 'Owner',
        width: 90,
        align: 'center',
        template: ({ value }) => (
            <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: '50%', fontSize: 11, fontWeight: 600,
                backgroundColor: '#dbeafe', color: '#1d4ed8',
            }}>
                {String(value ?? '?').charAt(0)}
            </span>
        ),
    },
    {
        field: 'progress',
        headerText: '%',
        width: 55,
        align: 'center',
        template: ({ value }) => (
            <span style={{ fontSize: 12, fontWeight: 600, color: Number(value) === 100 ? '#10b981' : '#6b7280' }}>
                {String(value ?? 0)}%
            </span>
        ),
    },
];

export const resourceTasks: GanttTask[] = [
    { id: 'r1', name: 'Sprint Planning', start: d(-7), end: d(-6), progress: 100, color: '#8b5cf6', assignee: 'Team', data: { type: 'Meeting' } },
    { id: 'r2', name: 'Feature: Auth', start: d(-6), end: d(2), progress: 75, assignee: 'Alice', data: { type: 'Dev', priority: 'High' } },
    { id: 'r3', name: 'Feature: Dashboard', start: d(-4), end: d(5), progress: 40, color: '#f59e0b', assignee: 'Bob', data: { type: 'Dev', priority: 'High' } },
    { id: 'r4', name: 'Bug Fixes', start: d(0), end: d(4), progress: 10, color: '#ef4444', assignee: 'Carol', data: { type: 'Bug', priority: 'Critical' } },
    { id: 'r5', name: 'Code Review', start: d(3), end: d(6), progress: 0, color: '#06b6d4', assignee: 'Dave', data: { type: 'Review' } },
    { id: 'r6', name: 'Documentation', start: d(5), end: d(10), progress: 0, color: '#10b981', assignee: 'Eve', data: { type: 'Docs' } },
    { id: 'r7', name: 'Sprint Review', start: d(10), end: d(11), progress: 0, color: '#8b5cf6', assignee: 'Team', data: { type: 'Meeting' } },
    { id: 'r8', name: 'Sprint Retrospective', start: d(11), end: d(11), progress: 0, color: '#8b5cf6', assignee: 'Team', data: { type: 'Meeting' } },
];

export const resourceColumns: GanttColumn[] = [
    { field: 'name', headerText: 'Task', width: 180 },
    {
        field: 'assignee',
        headerText: 'Assignee',
        width: 80,
        align: 'center',
    },
    {
        field: 'data.priority',
        headerText: 'Priority',
        width: 75,
        align: 'center',
        template: ({ task }) => {
            const priority = (task.data as Record<string, unknown>)?.priority as string | undefined;
            if (!priority) return <span style={{ color: '#9ca3af', fontSize: 11 }}>—</span>;
            const colors: Record<string, string> = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#10b981' };
            return (
                <span style={{
                    fontSize: 10, fontWeight: 600, padding: '1px 6px',
                    borderRadius: 10, backgroundColor: `${colors[priority]}20`,
                    color: colors[priority],
                }}>
                    {priority}
                </span>
            );
        },
    },
];

export const quarterlyTasks: GanttTask[] = [
    { id: 'q1', name: 'Q1 — Foundation', start: d(-60), end: d(-30), progress: 100, color: '#10b981', type: 'group', children: [
        { id: 'q1-1', name: 'Infrastructure Setup', start: d(-60), end: d(-45), progress: 100 },
        { id: 'q1-2', name: 'Core Platform', start: d(-48), end: d(-30), progress: 100 },
    ]},
    { id: 'q2', name: 'Q2 — Growth', start: d(-30), end: d(60), progress: 45, type: 'group', children: [
        { id: 'q2-1', name: 'Feature A', start: d(-30), end: d(10), progress: 90, color: '#8b5cf6' },
        { id: 'q2-2', name: 'Feature B', start: d(0), end: d(45), progress: 20, color: '#f59e0b' },
        { id: 'q2-3', name: 'Mobile App', start: d(20), end: d(60), progress: 0, color: '#06b6d4' },
    ]},
    { id: 'q3', name: 'Q3 — Scale', start: d(60), end: d(150), progress: 0, type: 'group', children: [
        { id: 'q3-1', name: 'Performance', start: d(60), end: d(100), progress: 0 },
        { id: 'q3-2', name: 'Enterprise', start: d(90), end: d(150), progress: 0, color: '#ef4444' },
    ]},
    { id: 'ms-v1', name: 'v1.0 Launch', type: 'milestone', start: d(60), end: d(60), color: '#f59e0b' },
    { id: 'ms-v2', name: 'v2.0 Launch', type: 'milestone', start: d(150), end: d(150), color: '#10b981' },
];
