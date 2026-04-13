import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicTasks, markers } from './gantt-chart-story-data';

const ReadOnly: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Set <code>readOnly</code> to disable all interactions. Useful for dashboards and reports.
            </p>
            <ComponentDemo title="Read-Only Gantt" centered={false}>
                <GanttChart
                    tasks={basicTasks}
                    height={300}
                    readOnly={true}
                    markers={markers}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`<GanttChart
  tasks={tasks}
  height={400}
  readOnly={true}
/>`}
                />
            </div>
        </>
    );
};

export default ReadOnly;
