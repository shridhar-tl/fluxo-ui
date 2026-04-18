import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import CustomColumnsDemo from './CustomColumns';
import DateMarkers from './DateMarkers';
import Dependencies from './Dependencies';
import DragAndDrop from './DragAndDrop';
import HierarchicalTasks from './HierarchicalTasks';
import QuarterlyView from './QuarterlyView';
import ReadOnly from './ReadOnly';
import SprintPlanning from './SprintPlanning';
import TaskCreation from './TaskCreation';
import TimelineOnly from './TimelineOnly';
import ViewModes from './ViewModes';



import _GanttChart_props_json from './../../../components/gantt-chart/GanttChart.props.json';
const { ganttProps, taskProps } = _GanttChart_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Minimal Gantt chart with default columns' },
    { id: 'view-modes', title: 'View Modes', description: 'Day, Week, Month, Quarter, Year views' },
    { id: 'hierarchical-tasks', title: 'Hierarchical Tasks', description: 'Nested tasks, groups, and milestones' },
    { id: 'dependencies', title: 'Dependencies', description: 'Task dependency arrows' },
    { id: 'date-markers', title: 'Date Markers', description: 'Vertical date markers' },
    { id: 'drag-and-drop', title: 'Drag & Drop', description: 'Interactive drag and resize' },
    { id: 'task-creation', title: 'Task Creation', description: 'Draw new tasks by dragging' },
    { id: 'custom-columns', title: 'Custom Columns', description: 'Custom column rendering' },
    { id: 'sprint-planning', title: 'Sprint Planning', description: 'Resource and sprint view' },
    { id: 'quarterly-view', title: 'Quarterly View', description: 'Long-range roadmap planning' },
    { id: 'read-only', title: 'Read-Only', description: 'Non-interactive mode' },
    { id: 'timeline-only', title: 'Timeline-Only', description: 'Hide fields panel' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'gantt-props', title: 'GanttChart Props', description: 'Component API reference' },
    { id: 'task-props', title: 'GanttTask Properties', description: 'Task object reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const ganttFeatures: FeatureItem[] = [
    {
        title: 'View Modes',
        description: '5 built-in scales: Day, Week, Month, Quarter, Year with smart header grouping',
        icon: 'M3 17V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m4 0V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10M3 17h18',
    },
    {
        title: 'Drag & Drop',
        description: 'Move tasks and resize from both ends with live visual feedback',
        icon: 'M7 11.5V14m0-2.5-3 3m3-3 3 3M17 11.5V14m0-2.5 3 3m-3-3-3 3M12 4v16M4 8h16M4 16h16',
    },
    { title: 'Task Creation', description: 'Draw new tasks by clicking and dragging on empty row space', icon: 'M12 4.5v15m7.5-7.5h-15' },
    {
        title: 'Hierarchical Tasks',
        description: 'Unlimited nesting depth with expand/collapse support',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Z',
    },
    {
        title: 'Task Types',
        description: 'Regular tasks, group/summary bars with caps, and diamond milestones',
        icon: 'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z M6 6h.008v.008H6V6Z',
    },
    {
        title: 'Dependencies',
        description: '4 dependency types (FS, SS, FF, SF) rendered as curved SVG arrows',
        icon: 'M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244',
    },
    {
        title: 'Progress Bars',
        description: 'Visual completion overlay on each task bar',
        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
    },
    {
        title: 'Date Markers',
        description: 'Labelled vertical lines for deadlines, sprints, and events',
        icon: 'M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5',
    },
    {
        title: 'Custom Columns',
        description: 'Any field from task data with full JSX template support',
        icon: 'M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z',
    },
    {
        title: 'Custom Tooltips',
        description: 'Per-task or global tooltip template override',
        icon: 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z',
    },
    {
        title: 'Holiday Support',
        description: 'isHoliday callback colors non-working days differently',
        icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
    },
    {
        title: 'Scroll Sync',
        description: 'Left and right panels stay vertically synchronized',
        icon: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
        title: 'Theming',
        description: 'Full dark/light + 5 brand themes via CSS variables — zero extra config',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
    {
        title: 'Responsive',
        description: 'Fields panel auto-hides on mobile, toolbar wraps on small screens',
        icon: 'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
    },
    {
        title: 'Accessibility',
        description: 'ARIA labels, keyboard focus, semantic roles on all interactive elements',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Performance',
        description: 'React.memo, useMemo, useCallback throughout — handles large datasets',
        icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z',
    },
];

const GanttChartPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Gantt Chart
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A full-featured project timeline component with drag &amp; drop, hierarchical tasks, dependencies, multiple view modes,
                    and rich customization.
                </p>
            </div>

            <section className="scroll-mt-8" id="basic-usage">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section className="scroll-mt-8" id="view-modes">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>View Modes</h2>
                <ViewModes />
            </section>

            <section className="scroll-mt-8" id="hierarchical-tasks">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Hierarchical Tasks &amp; Milestones
                </h2>
                <HierarchicalTasks />
            </section>

            <section className="scroll-mt-8" id="dependencies">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Task Dependencies
                </h2>
                <Dependencies />
            </section>

            <section className="scroll-mt-8" id="date-markers">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Date Markers</h2>
                <DateMarkers />
            </section>

            <section className="scroll-mt-8" id="drag-and-drop">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Drag &amp; Drop / Resize
                </h2>
                <DragAndDrop />
            </section>

            <section className="scroll-mt-8" id="task-creation">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Creating Tasks by Drawing
                </h2>
                <TaskCreation />
            </section>

            <section className="scroll-mt-8" id="custom-columns">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Columns</h2>
                <CustomColumnsDemo />
            </section>

            <section className="scroll-mt-8" id="sprint-planning">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Sprint / Resource Planning
                </h2>
                <SprintPlanning />
            </section>

            <section className="scroll-mt-8" id="quarterly-view">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Quarterly / Annual View
                </h2>
                <QuarterlyView />
            </section>

            <section className="scroll-mt-8" id="read-only">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Read-Only Mode</h2>
                <ReadOnly />
            </section>

            <section className="scroll-mt-8" id="timeline-only">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Timeline-Only View
                </h2>
                <TimelineOnly />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { GanttChart } from 'fluxo-ui';

// Type imports
import type {
  GanttTask,
  GanttColumn,
  GanttMarker,
  GanttDependency,
  GanttViewMode,
  GanttTaskChangeEvent,
  GanttTaskClickEvent,
  GanttTaskCreateEvent,
  GanttColumnTemplateProps,
  TaskBarTemplateProps,
} from 'fluxo-ui';`}
                />
            </section>

            <section className="scroll-mt-8" id="gantt-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    GanttChart Props
                </h2>
                <PropsTable props={ganttProps} />
            </section>

            <section className="scroll-mt-8" id="task-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    GanttTask Properties
                </h2>
                <PropsTable props={taskProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={ganttFeatures} />
            </section>
        </PageLayout>
    );
};

export default GanttChartPage;
