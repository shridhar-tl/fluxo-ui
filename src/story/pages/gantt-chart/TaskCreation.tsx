import cn from 'classnames';
import React, { useState } from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import type { GanttTask, GanttTaskCreateEvent } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { d } from './gantt-chart-story-data';

const TaskCreation: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [createableTasks, setCreateableTasks] = useState<GanttTask[]>([
        { id: 'c1', name: 'Existing Task', start: d(-3), end: d(3), progress: 50 },
    ]);
    const [lastEvent, setLastEvent] = useState<string>('');

    const handleTaskCreate = (e: GanttTaskCreateEvent) => {
        const newTask: GanttTask = {
            id: `new-${Date.now()}`,
            name: 'New Task',
            start: e.start,
            end: e.end,
            progress: 0,
            color: '#8b5cf6',
        };
        setCreateableTasks(prev => {
            const next = [...prev];
            const insertAt = Math.min(Math.max(e.rowIndex, 0), next.length);
            next.splice(insertAt, 0, newTask);
            return next;
        });
        setLastEvent(`Created task at row ${e.rowIndex + 1}: ${e.start.toLocaleDateString()} – ${e.end.toLocaleDateString()}`);
    };

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Enable <code>allowTaskCreate</code> and let users draw new tasks by clicking and dragging on empty row space.
            </p>
            <ComponentDemo title="Draw New Tasks (drag on empty area)" centered={false}>
                <div className="space-y-3">
                    <GanttChart
                        tasks={createableTasks}
                        height={300}
                        allowTaskCreate={true}
                        onTaskCreate={handleTaskCreate}
                        onTaskChange={(e) =>
                            setCreateableTasks(prev =>
                                prev.map(t => t.id === e.task.id ? { ...t, start: e.start, end: e.end } : t)
                            )
                        }
                    />
                    {lastEvent.startsWith('Created') && (
                        <div className={cn('text-sm px-4 py-2 rounded border', {
                            'border-green-800 bg-green-900/30 text-green-300': isDark,
                            'border-green-200 bg-green-50 text-green-800': !isDark,
                        })}>
                            {lastEvent}
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const [tasks, setTasks] = useState<GanttTask[]>(initialTasks);

const handleTaskCreate = (e: GanttTaskCreateEvent) => {
  const newTask: GanttTask = {
    id: \`task-\${Date.now()}\`,
    name: 'New Task',
    start: e.start,
    end: e.end,
    progress: 0,
  };
  setTasks(prev => [...prev, newTask]);
};

<GanttChart
  tasks={tasks}
  height={400}
  allowTaskCreate={true}
  onTaskCreate={handleTaskCreate}
/>`}
                />
            </div>
        </>
    );
};

export default TaskCreation;
