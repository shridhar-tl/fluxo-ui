import React from 'react';
import cn from 'classnames';
import PageLayout from '../../PageLayout';
import { useStoryTheme } from '../../StoryThemeContext';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import { PropsTable } from '../../PropsTable';
import BasicUsage from './BasicUsage';
import ViewModes from './ViewModes';
import CustomRendering from './CustomRendering';
import TimeGridConfig from './TimeGridConfig';
import DragDropResize from './DragDropResize';
import ImperativeApi from './ImperativeApi';
import PluginSystem from './PluginSystem';
import CompactMode from './CompactMode';
import NavigationPickerDemo from './NavigationPickerDemo';
import ExternalDragDrop from './ExternalDragDrop';
import DateBackgrounds from './DateBackgrounds';
import CustomToolbarEnd from './CustomToolbarEnd';
import PluginViews from './PluginViews';

import _Calendar_props_json from './../../../components/calendar/Calendar.props.json';
const { calendarProps } = _Calendar_props_json;
const sectionNavItems = [
  { id: 'basic-usage', title: 'Basic Usage', description: 'Core calendar with entries' },
  { id: 'view-modes', title: 'View Modes', description: 'All 8 built-in views' },
  { id: 'custom-rendering', title: 'Custom Rendering', description: 'Custom entry templates' },
  { id: 'time-grid-config', title: 'Time Grid Config', description: 'Slot duration, hours, format' },
  { id: 'drag-drop-resize', title: 'Drag, Drop & Resize', description: 'Interactive entry manipulation' },
  { id: 'imperative-api', title: 'Imperative API', description: 'Programmatic control via ref' },
  { id: 'plugin-views', title: 'Plugin Views', description: 'Tree-shakeable view plugins' },
  { id: 'plugin-system', title: 'Plugin System', description: 'Extend with custom plugins' },
  { id: 'external-drag', title: 'External Drag & Drop', description: 'Drop items from outside' },
  { id: 'date-backgrounds', title: 'Date Backgrounds', description: 'Highlight dates with colors' },
  { id: 'navigation-picker', title: 'Navigation Picker', description: 'Jump to any date via picker' },
  { id: 'custom-toolbar', title: 'Custom Toolbar', description: 'Custom toolbar end & icon-only picker' },
  { id: 'compact-mode', title: 'Compact Mode', description: 'Embedded & compact layouts' },
  { id: 'props', title: 'Props', description: 'Component props reference' },
  { id: 'features', title: 'Features', description: 'Feature highlights' },
];


const features: FeatureItem[] = [
  { title: '13+ View Modes', description: 'Month, week, day, year, agenda, N-day, list, multi-month, scroll — all as tree-shakeable plugins' },
  { title: 'Plugin Architecture', description: 'Tree-shakeable view plugins, custom views via defineView/createViewPlugin, toolbar actions, entry renderers' },
  { title: 'Drag & Drop', description: 'Move and resize entries with snap-to-grid and modifier key support' },
  { title: 'Custom Rendering', description: 'Full control over entry appearance via render callbacks' },
  { title: 'Theming', description: 'Automatic support for all brand themes and dark mode via CSS variables' },
  { title: 'Business Hours', description: 'Visual distinction between work and non-work hours' },
  { title: 'Now Indicator', description: 'Real-time current time line on time grid views' },
  { title: 'Imperative API', description: 'Programmatic navigation, view switching, and entry access via ref' },
  { title: 'Keyboard Accessible', description: 'ARIA labels, focus management, and keyboard navigation' },
  { title: 'All-Day Entries', description: 'Dedicated all-day row in time grid views' },
  { title: 'Responsive', description: 'Mobile-friendly with adaptive layouts and touch support' },
  { title: 'Configurable Grid', description: 'Slot duration, visible hours, first day of week, hidden days' },
];

const CalendarPage: React.FC = () => {
  const { isDark } = useStoryTheme();

  return (
    <PageLayout sectionNavItems={sectionNavItems}>
      <div>
        <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-white': isDark, 'text-gray-900': !isDark })}>
          Calendar
        </h1>
        <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
          A full-featured, plugin-extensible calendar component with 8 view modes,
          drag-and-drop, custom rendering, and a comprehensive imperative API.
        </p>
      </div>

      <section id="basic-usage" className="scroll-mt-8">
        <BasicUsage />
      </section>

      <section id="view-modes" className="scroll-mt-8">
        <ViewModes />
      </section>

      <section id="custom-rendering" className="scroll-mt-8">
        <CustomRendering />
      </section>

      <section id="time-grid-config" className="scroll-mt-8">
        <TimeGridConfig />
      </section>

      <section id="drag-drop-resize" className="scroll-mt-8">
        <DragDropResize />
      </section>

      <section id="imperative-api" className="scroll-mt-8">
        <ImperativeApi />
      </section>

      <section id="plugin-views" className="scroll-mt-8">
        <PluginViews />
      </section>

      <section id="plugin-system" className="scroll-mt-8">
        <PluginSystem />
      </section>

      <section id="external-drag" className="scroll-mt-8">
        <ExternalDragDrop />
      </section>

      <section id="date-backgrounds" className="scroll-mt-8">
        <DateBackgrounds />
      </section>

      <section id="navigation-picker" className="scroll-mt-8">
        <NavigationPickerDemo />
      </section>

      <section id="custom-toolbar" className="scroll-mt-8">
        <CustomToolbarEnd />
      </section>

      <section id="compact-mode" className="scroll-mt-8">
        <CompactMode />
      </section>

      <section id="props" className="scroll-mt-8">
        <h2 className={cn('text-2xl font-semibold mb-4', { 'text-white': isDark, 'text-gray-900': !isDark })}>
          Props
        </h2>
        <PropsTable props={calendarProps} />
      </section>

      <section id="features" className="scroll-mt-8">
        <h2 className={cn('text-2xl font-semibold mb-6', { 'text-white': isDark, 'text-gray-900': !isDark })}>
          Features
        </h2>
        <FeatureGrid features={features} />
      </section>
    </PageLayout>
  );
};

export default CalendarPage;
