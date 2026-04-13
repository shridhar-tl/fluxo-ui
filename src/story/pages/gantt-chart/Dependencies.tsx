import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { dependencyTasks } from './gantt-chart-story-data';

const Dependencies: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Connect tasks with dependency arrows using four relationship types: Finish-to-Start, Start-to-Start, Finish-to-Finish, and Start-to-Finish.
            </p>
            <ComponentDemo title="Dependency Arrows" centered={false}>
                <GanttChart
                    tasks={dependencyTasks}
                    height={340}
                    columns={[{ field: 'name', headerText: 'Task', width: 200 }]}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const tasks: GanttTask[] = [
  {
    id: 'analysis',
    name: 'Analysis',
    start: '2025-01-01',
    end: '2025-01-07',
    progress: 100,
  },
  {
    id: 'design',
    name: 'Design',
    start: '2025-01-08',
    end: '2025-01-14',
    progress: 60,
    dependencies: [{ targetId: 'analysis', type: 'finish-to-start' }],
  },
  {
    id: 'dev',
    name: 'Development',
    start: '2025-01-15',
    end: '2025-01-28',
    progress: 0,
    dependencies: [{ targetId: 'design', type: 'finish-to-start' }],
  },
];

// Supported dependency types:
// 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'`}
                />
            </div>
        </>
    );
};

export default Dependencies;
