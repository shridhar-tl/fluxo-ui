import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { d, resourceTasks, resourceColumns } from './gantt-chart-story-data';

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const SprintPlanning: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Use extra <code>data</code> fields with column templates to show metadata like priority or task type alongside the timeline.
            </p>
            <ComponentDemo title="Sprint Backlog View" centered={false}>
                <GanttChart
                    tasks={resourceTasks}
                    height={420}
                    columns={resourceColumns}
                    fieldsPanelWidth={360}
                    markers={[
                        { id: 'sprint-start', date: d(-7), label: 'Sprint Start', color: '#3b82f6' },
                        { id: 'sprint-end', date: d(11), label: 'Sprint End', color: '#f59e0b' },
                    ]}
                    isHoliday={isWeekend}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const tasks: GanttTask[] = [
  {
    id: 'feature-auth',
    name: 'Feature: Auth',
    start: '2025-01-06',
    end: '2025-01-14',
    progress: 75,
    assignee: 'Alice',
    data: { priority: 'High', type: 'Dev' },
  },
  // ...
];

const columns: GanttColumn[] = [
  { field: 'name', headerText: 'Task', width: 180 },
  { field: 'assignee', headerText: 'Assignee', width: 80, align: 'center' },
  {
    field: 'data.priority',
    headerText: 'Priority',
    width: 75,
    align: 'center',
    template: ({ task }) => {
      const priority = (task.data as any)?.priority;
      const colors = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6' };
      return (
        <span style={{
          padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 600,
          background: \`\${colors[priority]}20\`, color: colors[priority],
        }}>
          {priority}
        </span>
      );
    },
  },
];

// Mark weekends as holidays
const isHoliday = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

<GanttChart
  tasks={tasks}
  columns={columns}
  fieldsPanelWidth={360}
  isHoliday={isHoliday}
  markers={[
    { date: sprintStart, label: 'Sprint Start', color: '#3b82f6' },
    { date: sprintEnd,   label: 'Sprint End',   color: '#f59e0b' },
  ]}
  height={420}
/>`}
                />
            </div>
        </>
    );
};

export default SprintPlanning;
