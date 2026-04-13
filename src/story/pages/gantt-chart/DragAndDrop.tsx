import cn from 'classnames';
import React, { useState } from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import type { GanttTask, GanttTaskChangeEvent, GanttTaskClickEvent } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicTasks } from './gantt-chart-story-data';

const DragAndDrop: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [interactiveTasks, setInteractiveTasks] = useState<GanttTask[]>(basicTasks);
    const [lastEvent, setLastEvent] = useState<string>('');
    const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);

    const handleTaskChange = (e: GanttTaskChangeEvent) => {
        setInteractiveTasks(prev =>
            prev.map(t => t.id === e.task.id ? { ...t, start: e.start, end: e.end } : t)
        );
        setLastEvent(`Moved "${e.originalTask.name}" → ${e.start.toLocaleDateString()} – ${e.end.toLocaleDateString()}`);
    };

    const handleTaskClick = (e: GanttTaskClickEvent) => {
        setSelectedTask(e.task);
        setLastEvent(`Clicked: "${e.task.name}"`);
    };

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Drag task bars to move them or drag either handle to resize. Changes are reported via <code>onTaskChange</code>.
            </p>
            <ComponentDemo title="Interactive — Drag to Move, Handles to Resize" centered={false}>
                <div className="space-y-3">
                    <GanttChart
                        tasks={interactiveTasks}
                        height={320}
                        onTaskChange={handleTaskChange}
                        onTaskClick={handleTaskClick}
                    />
                    {lastEvent && (
                        <div className={cn('text-sm px-4 py-2 rounded border', {
                            'border-blue-800 bg-blue-900/30 text-blue-300': isDark,
                            'border-blue-200 bg-blue-50 text-blue-800': !isDark,
                        })}>
                            Event: {lastEvent}
                        </div>
                    )}
                    {selectedTask && (
                        <div className={cn('text-sm px-4 py-2 rounded border', {
                            'border-purple-800 bg-purple-900/30 text-purple-300': isDark,
                            'border-purple-200 bg-purple-50 text-purple-800': !isDark,
                        })}>
                            Selected: <strong>{selectedTask.name}</strong> — Progress: {selectedTask.progress ?? 0}%
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const [tasks, setTasks] = useState<GanttTask[]>(initialTasks);

const handleTaskChange = (e: GanttTaskChangeEvent) => {
  setTasks(prev =>
    prev.map(t => t.id === e.task.id
      ? { ...t, start: e.start, end: e.end }
      : t
    )
  );
};

<GanttChart
  tasks={tasks}
  height={400}
  allowTaskDrag={true}     // default
  allowTaskResize={true}   // default
  onTaskChange={handleTaskChange}
  onTaskClick={({ task }) => console.log('clicked', task.name)}
  onTaskDoubleClick={({ task }) => openEditModal(task)}
/>`}
                />
            </div>
        </>
    );
};

export default DragAndDrop;
