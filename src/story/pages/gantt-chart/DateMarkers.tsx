import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { bands, basicTasks, markers } from './gantt-chart-story-data';

const DateMarkers: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Mark important dates (deadlines, releases) with labelled vertical lines and shade date ranges such as sprints with bands. Labels sit in a header row and are stacked when they collide. Overlapping bands get their own row, a band shows its shortLabel when the label does not fit, and the timeline widens to fill the panel (fillWidth).
            </p>
            <ComponentDemo title="Markers &amp; Deadlines" centered={false}>
                <GanttChart tasks={basicTasks} height={340} markers={markers} bands={bands} />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import type { GanttBand, GanttMarker } from 'fluxo-ui';

const markers: GanttMarker[] = [
  { id: 'today',    date: new Date(),               label: 'Today',      color: '#3b82f6' },
  { id: 'sprint',   date: new Date('2025-02-07'),   label: 'Sprint End', color: '#f59e0b' },
  { id: 'release',  date: new Date('2025-02-28'),   label: 'Release',    color: '#10b981' },
];

const bands: GanttBand[] = [
  { id: 's12', start: '2025-01-27', end: '2025-02-07', label: 'Sprint 12', shortLabel: '12' },
  { id: 's13', start: '2025-02-10', end: '2025-02-21', label: 'Sprint 13', shortLabel: '13' },
];

<GanttChart tasks={tasks} markers={markers} bands={bands} height={400} />`}
                />
            </div>
        </>
    );
};

export default DateMarkers;
