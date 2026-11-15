import type { ResourceTimelineEvent, ResourceTimelineResource } from '../../../components/resource-timeline';

function day(offset: number): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date;
}

export const storyStart = day(-3);
export const storyEnd = day(27);

export const storyResources: ResourceTimelineResource[] = [
    { id: 'alice', name: 'Alice Martin', data: { role: 'Frontend' } },
    { id: 'bob', name: 'Bob Chen', data: { role: 'Backend' } },
    { id: 'carla', name: 'Carla Diaz', data: { role: 'QA' } },
    { id: 'dev', name: 'Dev Patel', data: { role: 'Backend' } },
];

export const storyEvents: ResourceTimelineEvent[] = [
    { id: 'e1', resourceId: 'alice', start: day(0), end: day(4), title: 'Checkout page', color: '#3b82f6', textColor: '#ffffff' },
    { id: 'e2', resourceId: 'alice', start: day(3), end: day(8), title: 'Design review fixes', color: '#8b5cf6', textColor: '#ffffff' },
    { id: 'e3', resourceId: 'bob', start: day(1), end: day(10), title: 'Payments API', color: '#10b981', textColor: '#ffffff' },
    { id: 'e4', resourceId: 'carla', start: day(5), end: day(7), title: 'Regression tests', color: '#f59e0b', textColor: '#1f2937' },
    { id: 'e5', resourceId: 'dev', start: day(9), end: day(14), title: 'Search indexing', color: '#ef4444', textColor: '#ffffff' },
];

export const leaveDays: Record<string, number[]> = {
    carla: [10, 11, 12],
    bob: [15],
};

export function isLeaveDay(date: Date, resourceId: string): boolean {
    const offset = Math.round((date.getTime() - day(0).getTime()) / 86400000);
    return (leaveDays[resourceId] || []).includes(offset);
}
