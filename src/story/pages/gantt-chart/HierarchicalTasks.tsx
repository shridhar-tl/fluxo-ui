import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { hierarchicalTasks } from './gantt-chart-story-data';

const HierarchicalTasks: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Nest child tasks inside a parent using the <code>children</code> array. Use <code>type: 'group'</code> for summary bars and <code>type: 'milestone'</code> for diamond markers. Groups can be collapsed.
            </p>
            <ComponentDemo title="Phases, Groups &amp; Milestones" centered={false}>
                <GanttChart
                    tasks={hierarchicalTasks}
                    height={440}
                    columns={[
                        { field: 'name', headerText: 'Task', width: 200 },
                        { field: 'assignee', headerText: 'Owner', width: 90, align: 'center' },
                    ]}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const tasks: GanttTask[] = [
  {
    id: 'phase-1',
    name: 'Phase 1 — Discovery',
    type: 'group',
    start: new Date('2025-01-01'),
    end: new Date('2025-01-14'),
    progress: 90,
    children: [
      { id: 'p1-t1', name: 'Stakeholder Interviews', start: '2025-01-01', end: '2025-01-05', progress: 100 },
      { id: 'p1-t2', name: 'Market Research',        start: '2025-01-03', end: '2025-01-10', progress: 80 },
    ],
  },
  {
    id: 'milestone-1',
    name: 'Design Review',
    type: 'milestone',
    start: new Date('2025-01-14'),
    end: new Date('2025-01-14'),
    color: '#f59e0b',
  },
];

<GanttChart tasks={tasks} height={400} />`}
                />
            </div>
        </>
    );
};

export default HierarchicalTasks;
