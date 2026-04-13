import type { KanbanCardData, KanbanColumnData, KanbanLabel, KanbanAssignee } from '../../../components/kanban-board';

const d = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
};

export const labels: Record<string, KanbanLabel> = {
    design: { id: 'design', text: 'Design', color: '#8b5cf6' },
    frontend: { id: 'frontend', text: 'Frontend', color: '#3b82f6' },
    backend: { id: 'backend', text: 'Backend', color: '#f59e0b' },
    testing: { id: 'testing', text: 'Testing', color: '#10b981' },
    devops: { id: 'devops', text: 'DevOps', color: '#06b6d4' },
    docs: { id: 'docs', text: 'Docs', color: '#ec4899' },
    security: { id: 'security', text: 'Security', color: '#ef4444' },
    perf: { id: 'perf', text: 'Performance', color: '#ef4444' },
    mobile: { id: 'mobile', text: 'Mobile', color: '#14b8a6' },
    ux: { id: 'ux', text: 'UX', color: '#a855f7' },
};

export const assignees: Record<string, KanbanAssignee> = {
    alice: { id: 'a1', name: 'Alice Martin' },
    bob: { id: 'a2', name: 'Bob Chen' },
    carol: { id: 'a3', name: 'Carol Davis' },
    dan: { id: 'a4', name: 'Dan Evans' },
    eve: { id: 'a5', name: 'Eve Foster' },
    frank: { id: 'a6', name: 'Frank Garcia' },
};

export const basicColumns: KanbanColumnData[] = [
    { id: 'backlog', title: 'Backlog', color: '#94a3b8' },
    { id: 'todo', title: 'To Do', color: '#3b82f6' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b', limit: 3 },
    { id: 'review', title: 'Review', color: '#8b5cf6' },
    { id: 'done', title: 'Done', color: '#10b981' },
];

export const basicCards: KanbanCardData[] = [
    {
        id: '1', title: 'Design landing page mockup', columnId: 'backlog', order: 0,
        priority: 'medium', labels: [labels.design],
        assignee: assignees.alice,
    },
    {
        id: '2', title: 'Implement user authentication API', columnId: 'backlog', order: 1,
        priority: 'high', labels: [labels.backend],
        dueDate: d(5),
    },
    {
        id: '3', title: 'Write unit tests for payment module', columnId: 'todo', order: 0,
        priority: 'medium', labels: [labels.testing],
        assignee: assignees.bob,
    },
    {
        id: '4', title: 'Set up CI/CD pipeline', columnId: 'todo', order: 1,
        priority: 'low', labels: [labels.devops],
    },
    {
        id: '5', title: 'Migrate database schema to v2', columnId: 'in-progress', order: 0,
        priority: 'critical', labels: [labels.backend],
        assignee: assignees.carol, dueDate: d(-1),
        progress: 65, subtaskCount: 8, subtaskCompleted: 5,
    },
    {
        id: '6', title: 'Refactor notification service', columnId: 'in-progress', order: 1,
        priority: 'medium',
        assignees: [assignees.alice, assignees.bob],
        commentCount: 3,
    },
    {
        id: '7', title: 'Update API documentation', columnId: 'in-progress', order: 2,
        priority: 'low', labels: [labels.docs],
        attachmentCount: 2,
    },
    {
        id: '8', title: 'Fix responsive layout on mobile', columnId: 'review', order: 0,
        priority: 'high', labels: [labels.frontend],
        assignee: assignees.dan, dueDate: d(2),
        commentCount: 5, progress: 90,
    },
    {
        id: '9', title: 'Implement dark mode toggle', columnId: 'done', order: 0,
        priority: 'medium', labels: [labels.frontend],
        assignee: assignees.alice, progress: 100,
    },
    {
        id: '10', title: 'Security audit fixes', columnId: 'done', order: 1,
        priority: 'critical', labels: [labels.security],
        progress: 100,
    },
];

export const detailedColumns: KanbanColumnData[] = [
    { id: 'todo', title: 'To Do', color: '#3b82f6' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b', limit: 4 },
    { id: 'review', title: 'In Review', color: '#8b5cf6' },
];

export const detailedCards: KanbanCardData[] = [
    {
        id: 'd1', title: 'Redesign dashboard with new brand guidelines', columnId: 'todo', order: 0,
        description: 'Update all dashboard components to match the new brand colors, typography, and spacing system.',
        priority: 'high',
        labels: [labels.design, labels.frontend],
        assignees: [assignees.alice, assignees.bob, assignees.carol, assignees.dan],
        dueDate: d(7), progress: 30, subtaskCount: 12, subtaskCompleted: 4,
        commentCount: 8, attachmentCount: 3,
    },
    {
        id: 'd2', title: 'Optimize database queries for reports', columnId: 'in-progress', order: 0,
        description: 'Several report queries are taking >5s. Need to add proper indexes and optimize JOINs.',
        priority: 'critical',
        labels: [labels.backend, labels.perf],
        assignee: assignees.carol,
        dueDate: d(-2), progress: 55, subtaskCount: 6, subtaskCompleted: 3,
        commentCount: 12,
    },
    {
        id: 'd3', title: 'Add two-factor authentication', columnId: 'in-progress', order: 1,
        description: 'Implement TOTP-based 2FA with QR code enrollment and backup codes.',
        priority: 'high',
        labels: [labels.security, labels.backend],
        assignee: assignees.bob,
        dueDate: d(3), progress: 40,
        commentCount: 4, attachmentCount: 1,
    },
    {
        id: 'd4', title: 'Implement webhook retry mechanism', columnId: 'review', order: 0,
        description: 'Add exponential backoff retry logic for failed webhook deliveries with configurable max attempts.',
        priority: 'medium',
        labels: [labels.backend],
        assignee: assignees.dan,
        progress: 95, subtaskCount: 5, subtaskCompleted: 5,
        commentCount: 2,
    },
];

export const compactColumns: KanbanColumnData[] = [
    { id: 'open', title: 'Open', color: '#3b82f6' },
    { id: 'active', title: 'Active', color: '#f59e0b' },
    { id: 'closed', title: 'Closed', color: '#10b981' },
];

export const compactCards: KanbanCardData[] = [
    { id: 'c1', title: 'Fix login timeout issue', columnId: 'open', order: 0, priority: 'high' },
    { id: 'c2', title: 'Update email templates', columnId: 'open', order: 1, priority: 'low' },
    { id: 'c3', title: 'Add export to CSV feature', columnId: 'open', order: 2, priority: 'medium' },
    { id: 'c4', title: 'Review pull request #342', columnId: 'active', order: 0, priority: 'high' },
    { id: 'c5', title: 'Deploy staging environment', columnId: 'active', order: 1, priority: 'medium' },
    { id: 'c6', title: 'Update dependencies', columnId: 'closed', order: 0, priority: 'low' },
    { id: 'c7', title: 'Fix broken navigation links', columnId: 'closed', order: 1, priority: 'high' },
];

export const wipColumns: KanbanColumnData[] = [
    { id: 'todo', title: 'To Do', color: '#3b82f6' },
    { id: 'dev', title: 'Development', color: '#f59e0b', limit: 2 },
    { id: 'qa', title: 'QA', color: '#8b5cf6', limit: 2 },
    { id: 'done', title: 'Done', color: '#10b981' },
];

export const wipCards: KanbanCardData[] = [
    { id: 'w1', title: 'Feature: User Profiles', columnId: 'todo', order: 0, priority: 'high', assignee: assignees.alice },
    { id: 'w2', title: 'Feature: Notifications', columnId: 'todo', order: 1, priority: 'medium' },
    { id: 'w3', title: 'Bug: Login redirect', columnId: 'dev', order: 0, priority: 'critical', assignee: assignees.bob },
    { id: 'w4', title: 'Feature: Export CSV', columnId: 'dev', order: 1, priority: 'medium', assignee: assignees.carol },
    { id: 'w5', title: 'Feature: Dark Mode', columnId: 'dev', order: 2, priority: 'low', assignee: assignees.dan },
    { id: 'w6', title: 'Bug: Date formatting', columnId: 'qa', order: 0, priority: 'high', assignee: assignees.eve },
    { id: 'w7', title: 'Feature: File Upload', columnId: 'qa', order: 1, priority: 'medium' },
    { id: 'w8', title: 'Feature: Webhooks', columnId: 'qa', order: 2, priority: 'low' },
    { id: 'w9', title: 'Feature: Search', columnId: 'done', order: 0, priority: 'medium', progress: 100 },
];

export const lockedColumns: KanbanColumnData[] = [
    { id: 'new', title: 'New', color: '#3b82f6' },
    { id: 'active', title: 'Active', color: '#f59e0b' },
    { id: 'archived', title: 'Archived', color: '#94a3b8', locked: true },
];

export const lockedCards: KanbanCardData[] = [
    { id: 'l1', title: 'Design new onboarding flow', columnId: 'new', order: 0, priority: 'high', assignee: assignees.alice },
    { id: 'l2', title: 'Add payment gateway integration', columnId: 'new', order: 1, priority: 'medium' },
    { id: 'l3', title: 'Implement real-time chat', columnId: 'active', order: 0, priority: 'high', assignee: assignees.bob },
    { id: 'l4', title: 'Setup monitoring alerts', columnId: 'active', order: 1, priority: 'low', assignee: assignees.carol },
    { id: 'l5', title: 'Legacy API migration', columnId: 'archived', order: 0, priority: 'medium' },
    { id: 'l6', title: 'Old dashboard redesign', columnId: 'archived', order: 1, priority: 'low' },
];

export const blockedCards: KanbanCardData[] = [
    {
        id: 'b1', title: 'Implement SSO integration', columnId: 'in-progress', order: 0,
        priority: 'high', blocked: true, color: '#ef4444',
        labels: [labels.security], assignee: assignees.alice,
        description: 'Blocked: Waiting for IdP credentials from the security team.',
    },
    {
        id: 'b2', title: 'Mobile app push notifications', columnId: 'in-progress', order: 1,
        priority: 'medium', blocked: true,
        labels: [labels.mobile], assignee: assignees.dan,
    },
    {
        id: 'b3', title: 'Build search microservice', columnId: 'in-progress', order: 2,
        priority: 'high',
        labels: [labels.backend], assignee: assignees.bob,
        progress: 60, subtaskCount: 4, subtaskCompleted: 2,
    },
    {
        id: 'b4', title: 'Upgrade React to v19', columnId: 'todo', order: 0,
        priority: 'medium', labels: [labels.frontend],
    },
    {
        id: 'b5', title: 'Write E2E test suite', columnId: 'todo', order: 1,
        priority: 'low', labels: [labels.testing], assignee: assignees.eve,
    },
];

export const blockedColumns: KanbanColumnData[] = [
    { id: 'todo', title: 'To Do', color: '#3b82f6' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' },
];

export const verticalColumns: KanbanColumnData[] = [
    { id: 'high', title: 'High Priority', color: '#ef4444' },
    { id: 'medium', title: 'Medium Priority', color: '#f59e0b' },
    { id: 'low', title: 'Low Priority', color: '#10b981' },
];

export const verticalCards: KanbanCardData[] = [
    { id: 'v1', title: 'Fix critical security vulnerability', columnId: 'high', order: 0, priority: 'critical', assignee: assignees.alice },
    { id: 'v2', title: 'Resolve production database deadlock', columnId: 'high', order: 1, priority: 'critical', assignee: assignees.carol },
    { id: 'v3', title: 'Patch API rate limiting bypass', columnId: 'high', order: 2, priority: 'high' },
    { id: 'v4', title: 'Improve search result relevance', columnId: 'medium', order: 0, priority: 'medium', assignee: assignees.bob },
    { id: 'v5', title: 'Add caching layer for reports', columnId: 'medium', order: 1, priority: 'medium' },
    { id: 'v6', title: 'Refactor CSS to design tokens', columnId: 'low', order: 0, priority: 'low', assignee: assignees.eve },
    { id: 'v7', title: 'Update copyright footer text', columnId: 'low', order: 1, priority: 'low' },
];

export let nextId = 100;
export const getNextId = () => `new-${++nextId}`;
