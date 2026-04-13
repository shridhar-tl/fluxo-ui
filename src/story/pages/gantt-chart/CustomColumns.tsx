import cn from 'classnames';
import React from 'react';
import { GanttChart } from '../../../components/gantt-chart';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicTasks, customColumns } from './gantt-chart-story-data';

const CustomColumnsDemo: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Define any number of columns with custom render templates. Access the full task object inside templates.
            </p>
            <ComponentDemo title="Custom Column Rendering" centered={false}>
                <GanttChart
                    tasks={basicTasks}
                    height={340}
                    columns={customColumns}
                    fieldsPanelWidth={370}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import type { GanttColumn } from 'ether-ui';

const columns: GanttColumn[] = [
  { field: 'name', headerText: 'Task', width: 200 },
  {
    field: 'assignee',
    headerText: 'Owner',
    width: 90,
    align: 'center',
    template: ({ value }) => (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 26, height: 26, borderRadius: '50%',
        background: '#dbeafe', color: '#1d4ed8', fontWeight: 600, fontSize: 11,
      }}>
        {String(value ?? '?').charAt(0)}
      </span>
    ),
  },
  {
    field: 'progress',
    headerText: '%',
    width: 55,
    align: 'center',
    template: ({ value }) => (
      <span style={{ color: value === 100 ? '#10b981' : '#6b7280', fontWeight: 600 }}>
        {value}%
      </span>
    ),
  },
];

<GanttChart tasks={tasks} columns={columns} fieldsPanelWidth={360} height={400} />`}
                />
            </div>
        </>
    );
};

export default CustomColumnsDemo;
