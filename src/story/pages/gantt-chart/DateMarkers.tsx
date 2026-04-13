import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicTasks, markers } from './gantt-chart-story-data';

const DateMarkers: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Mark important dates (sprint boundaries, deadlines, releases) with labelled vertical lines.
            </p>
            <ComponentDemo title="Markers &amp; Deadlines" centered={false}>
                <GanttChart
                    tasks={basicTasks}
                    height={340}
                    markers={markers}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import type { GanttMarker } from 'ether-ui';

const markers: GanttMarker[] = [
  { id: 'today',    date: new Date(),               label: 'Today',      color: '#3b82f6' },
  { id: 'sprint',   date: new Date('2025-02-07'),   label: 'Sprint End', color: '#f59e0b' },
  { id: 'release',  date: new Date('2025-02-28'),   label: 'Release',    color: '#10b981' },
];

<GanttChart tasks={tasks} markers={markers} height={400} />`}
                />
            </div>
        </>
    );
};

export default DateMarkers;
