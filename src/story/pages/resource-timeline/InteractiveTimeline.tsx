import React, { useCallback, useState } from 'react';
import { ResourceTimeline } from '../../../components/resource-timeline';
import type { ResourceTimelineDropEvent, ResourceTimelineEvent, ResourceTimelineEventChangeEvent } from '../../../components/resource-timeline';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { isLeaveDay, storyEnd, storyEvents, storyResources, storyStart } from './resource-timeline-story-data';

const dragType = 'application/x-story-task';
const backlog = ['Onboarding emails', 'Audit log export', 'Dark mode polish'];

const code = `const [events, setEvents] = useState(initialEvents);

<ResourceTimeline
  resources={resources}
  events={events}
  startDate={start}
  endDate={end}
  isNonWorkingDay={(date, resourceId) => date.getDay() === 0 || date.getDay() === 6 || isLeave(date, resourceId)}
  dayCellTemplate={(resource, date) => <LoadCell resource={resource} date={date} />}
  onEventChange={({ item, start, end, resourceId }) =>
    setEvents((list) => list.map((e) => (e.id === item.id ? { ...e, start, end, resourceId } : e)))
  }
  onExternalDrop={({ resourceId, date, dataTransfer }) => addTask(dataTransfer.getData('text/plain'), resourceId, date)}
/>`;

function countOnDay(events: ResourceTimelineEvent[], resourceId: string, date: Date): number {
    const time = date.getTime();
    return events.filter((e) => e.resourceId === resourceId && new Date(e.start).getTime() <= time && new Date(e.end).getTime() >= time).length;
}

const InteractiveTimeline: React.FC = () => {
    const [events, setEvents] = useState<ResourceTimelineEvent[]>(storyEvents);
    const [pending, setPending] = useState<string[]>(backlog);
    const [log, setLog] = useState<string>('Drag a bar along the row, to another person, or drop a task from the list.');

    const handleChange = useCallback(({ item, start, end, resourceId, previousResourceId }: ResourceTimelineEventChangeEvent) => {
        setEvents((list) => list.map((e) => (e.id === item.id ? { ...e, start, end, resourceId } : e)));
        setLog(`${item.title}: ${start.toDateString()} – ${end.toDateString()}${resourceId !== previousResourceId ? ` (moved to ${resourceId})` : ''}`);
    }, []);

    const handleDrop = useCallback(({ resourceId, date, dataTransfer }: ResourceTimelineDropEvent) => {
        const title = dataTransfer.getData(dragType);
        if (!title) return;
        const end = new Date(date.getTime());
        end.setDate(end.getDate() + 2);
        setEvents((list) => [...list, { id: `new-${list.length}`, resourceId, start: date, end, title, color: '#0ea5e9', textColor: '#ffffff' }]);
        setPending((list) => list.filter((t) => t !== title));
        setLog(`${title} planned for ${resourceId} from ${date.toDateString()}`);
    }, []);

    return (
        <>
            <ComponentDemo title="Plan and reassign" description="Move, resize, reassign, drop new work and show a load row under each person." centered={false}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {pending.map((title) => (
                            <div
                                key={title}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData(dragType, title)}
                                style={{ padding: '4px 8px', borderRadius: 6, border: '1px dashed var(--eui-border-subtle)', color: 'var(--eui-text)', cursor: 'grab' }}
                            >
                                {title}
                            </div>
                        ))}
                    </div>
                    <ResourceTimeline
                        resources={storyResources}
                        events={events}
                        startDate={storyStart}
                        endDate={storyEnd}
                        height={360}
                        isNonWorkingDay={(date, resourceId) => date.getDay() === 0 || date.getDay() === 6 || isLeaveDay(date, resourceId)}
                        dayCellTemplate={(resource, date) => {
                            const count = countOnDay(events, resource.id, date);
                            return count ? (
                                <div style={{ textAlign: 'center', fontSize: 11, lineHeight: '24px', color: count > 1 ? '#dc2626' : 'var(--eui-text-muted)' }}>{count}</div>
                            ) : null;
                        }}
                        markers={[{ date: storyEnd, label: 'Release' }]}
                        onEventChange={handleChange}
                        onExternalDrop={handleDrop}
                    />
                    <div style={{ fontSize: 13, color: 'var(--eui-text-muted)' }}>{log}</div>
                </div>
            </ComponentDemo>
            <CodeBlock code={code} />
        </>
    );
};

export default InteractiveTimeline;
