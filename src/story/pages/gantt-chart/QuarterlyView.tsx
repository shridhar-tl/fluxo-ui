import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { quarterlyTasks } from './gantt-chart-story-data';

const QuarterlyView: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Use <code>viewMode="quarter"</code> or <code>"year"</code> for roadmap-level planning across many months.
            </p>
            <ComponentDemo title="Quarterly Roadmap" centered={false}>
                <GanttChart
                    tasks={quarterlyTasks}
                    viewMode="month"
                    height={380}
                    columns={[{ field: 'name', headerText: 'Initiative', width: 200 }]}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`<GanttChart
  tasks={roadmapTasks}
  viewMode="month"    // or "quarter" | "year" for wider ranges
  height={400}
  columns={[{ field: 'name', headerText: 'Initiative', width: 200 }]}
/>`}
                />
            </div>
        </>
    );
};

export default QuarterlyView;
