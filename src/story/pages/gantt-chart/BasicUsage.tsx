import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicTasks } from './gantt-chart-story-data';

const BasicUsage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                A minimal Gantt chart with default columns. Tasks auto-scroll to today on mount.
            </p>
            <ComponentDemo title="Basic Gantt Chart" centered={false}>
                <GanttChart tasks={basicTasks} height={340} />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    title="Basic Example"
                    code={`import { GanttChart } from 'ether-ui';
import type { GanttTask } from 'ether-ui';

const tasks: GanttTask[] = [
  {
    id: '1',
    name: 'Requirements Gathering',
    start: new Date('2025-01-01'),
    end: new Date('2025-01-07'),
    progress: 100,
    assignee: 'Alice',
  },
  {
    id: '2',
    name: 'UI Design',
    start: new Date('2025-01-06'),
    end: new Date('2025-01-14'),
    progress: 60,
    color: '#8b5cf6',
    assignee: 'Bob',
  },
  // ...
];

function MyPage() {
  return <GanttChart tasks={tasks} height={400} />;
}`}
                />
            </div>
        </>
    );
};

export default BasicUsage;
