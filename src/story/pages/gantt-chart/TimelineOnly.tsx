import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicTasks, d } from './gantt-chart-story-data';

const TimelineOnly: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Hide the left fields panel entirely with <code>showFieldsPanel=&#123;false&#125;</code> for a compact timeline.
            </p>
            <ComponentDemo title="No Fields Panel" centered={false}>
                <GanttChart
                    tasks={basicTasks}
                    height={280}
                    showFieldsPanel={false}
                    markers={[{ id: 't', date: d(0), label: 'Today', color: '#3b82f6' }]}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`<GanttChart
  tasks={tasks}
  height={300}
  showFieldsPanel={false}
/>`}
                />
            </div>
        </>
    );
};

export default TimelineOnly;
