import React, { useRef, useState } from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { CalendarApi } from '../../../components/calendar';
import {
  timeGridPlugin,
  monthGridPlugin,
  yearGridPlugin,
  agendaPlugin,
  timeGridCustomPlugin,
  listViewPlugin,
} from '../../../components/calendar/plugins';
import { Button } from '../../../components/Button';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries } from './calendar-story-data';

const plugins = [
  timeGridPlugin(),
  monthGridPlugin(),
  listViewPlugin(),
  yearGridPlugin(),
  agendaPlugin({ dayCount: 14 }),
  timeGridCustomPlugin({ dayCount: 3, label: '3 Days' }),
];

const viewButtons: { label: string; value: string }[] = [
  { label: 'Week', value: ViewMode.timeGridWeek },
  { label: 'Month', value: ViewMode.dayGridMonth },
  { label: '3 Days', value: ViewMode.timeGrid3Day },
  { label: 'Year', value: ViewMode.yearGrid },
  { label: 'Agenda', value: ViewMode.agenda },
  { label: 'Month List', value: ViewMode.listMonth },
];

const pluginViewCode = `import {
  Calendar,
  timeGridPlugin, monthGridPlugin,
  yearGridPlugin, agendaPlugin,
  timeGridCustomPlugin,
} from 'ether-ui';

// Only bundle the views you need
const plugins = [
  timeGridPlugin(),        // timeGridWeek + timeGridDay
  monthGridPlugin(),       // dayGridMonth
  yearGridPlugin(),        // yearGrid (12-month overview)
  agendaPlugin({ dayCount: 14 }),  // 2-week agenda
  timeGridCustomPlugin({ dayCount: 3, label: '3 Days' }),
];

<Calendar
  plugins={plugins}
  initialView="timeGridWeek"
  entries={entries}
/>`;

const headerToolbarViewsCode = `// Only show specific views in the toolbar dropdown
<Calendar
  headerToolbarViews={['timeGridWeek', 'dayGridMonth', 'yearGrid']}
  entries={entries}
/>`;

const customPluginCode = `import { createViewPlugin, defineView } from 'ether-ui';

// Build your own view
const myView = defineView({
  name: 'myCustomView',
  label: 'My View',
  component: MyViewComponent,  // React component with ViewProps
  getDateRange: (date, firstDayOfWeek) => ({ start, end }),
  getTitle: (range) => 'My Custom Title',
  navigate: (date, dir) =>
    dir === 'prev' ? subDays(date, 7) : addDays(date, 7),
});

const myPlugin = createViewPlugin({
  name: 'my-plugin',
  views: [myView],
});

<Calendar plugins={[myPlugin]} initialView="myCustomView" />`;

const PluginViews: React.FC = () => {
  const apiRef = useRef<CalendarApi>(null);
  const [currentView, setCurrentView] = useState<string>(ViewMode.timeGridWeek);

  return (
    <>
      <ComponentDemo
        title="Plugin-Based Views"
        description="Views are tree-shakeable plugins. Only import what you need — unused views won't be bundled. New views: Year Grid, Agenda, and custom N-day time grids."
        centered={false}
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {viewButtons.map(opt => (
            <Button
              key={opt.value}
              label={opt.label}
              size="xs"
              variant={currentView === opt.value ? 'primary' : 'default'}
              layout={currentView === opt.value ? 'default' : 'outlined'}
              onClick={() => {
                apiRef.current?.changeView(opt.value);
                setCurrentView(opt.value);
              }}
            />
          ))}
        </div>
        <div style={{ height: 550, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.timeGridWeek}
            height="100%"
            apiRef={apiRef}
            plugins={plugins}
            nowIndicator
            onViewChange={setCurrentView}
          />
        </div>
      </ComponentDemo>
      <div className="mt-4 space-y-4">
        <CodeBlock title="Plugin-based view selection" code={pluginViewCode} />
        <CodeBlock title="Restrict toolbar views via headerToolbarViews" code={headerToolbarViewsCode} />
        <CodeBlock title="Create your own custom view plugin" code={customPluginCode} />
      </div>
    </>
  );
};

export default PluginViews;
