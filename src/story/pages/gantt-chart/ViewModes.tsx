import cn from 'classnames';
import React, { useState } from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import type { GanttViewMode } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicTasks } from './gantt-chart-story-data';

const ViewModes: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [viewMode, setViewMode] = useState<GanttViewMode>('day');

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Switch between Day, Week, Month, Quarter, and Year views. Can be controlled externally or left to the built-in toolbar.
            </p>
            <ComponentDemo title="Controlled View Mode" centered={false}>
                <GanttChart
                    tasks={basicTasks}
                    height={320}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const [viewMode, setViewMode] = useState<GanttViewMode>('day');

<GanttChart
  tasks={tasks}
  height={400}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
/>`}
                />
            </div>
        </>
    );
};

export default ViewModes;
