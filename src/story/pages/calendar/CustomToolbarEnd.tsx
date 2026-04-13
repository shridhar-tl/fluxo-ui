import React from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { ToolbarEndRenderProps } from '../../../components/calendar';
import { Button } from '../../../components/Button';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries } from './calendar-story-data';

const customToolbarEndCode = `import { Calendar, ToolbarEndRenderProps } from 'ether-ui';

<Calendar
  entries={entries}
  initialView="timeGridWeek"
  showNavigationPicker
  renderToolbarEnd={({ viewSwitcher, pluginActions }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button onClick={() => alert('Custom action!')}>+ New Event</button>
      {pluginActions}
      {viewSwitcher}
    </div>
  )}
/>

// The renderToolbarEnd callback receives:
// - viewSwitcher: The view mode dropdown (ReactNode)
// - pluginActions: Plugin toolbar actions for the end slot (ReactNode)
// Compose them in any order alongside your own components.`;

const iconOnlyPickerCode = `<Calendar
  entries={entries}
  initialView="timeGridWeek"
  showNavigationPicker
  navigationPickerIconOnly
/>

// With navigationPickerIconOnly:
// - Title text remains visible as the header
// - A small calendar icon appears next to nav buttons
//   to open the date picker popover
// Without navigationPickerIconOnly (default):
// - The date range picker replaces the title,
//   styled as the header text with a picker icon`;

const CustomToolbarEnd: React.FC = () => {
  return (
    <>
      <ComponentDemo
        title="Custom Toolbar End"
        description="Use renderToolbarEnd to compose the right side of the toolbar with your own components alongside the built-in view switcher and plugin actions."
        centered={false}
      >
        <div style={{ height: 500, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.timeGridWeek}
            height="100%"
            showNavigationPicker
            nowIndicator
            renderToolbarEnd={({ viewSwitcher, pluginActions }: ToolbarEndRenderProps) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button label="+ New Event" size="sm" onClick={() => alert('Create new event!')} />
                <Button label="Filter" size="sm" layout="outlined" onClick={() => alert('Open filters!')} />
                {pluginActions}
                {viewSwitcher}
              </div>
            )}
          />
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Custom Toolbar End" code={customToolbarEndCode} />
      </div>

      <div className="mt-8">
        <ComponentDemo
          title="Icon-Only Navigation Picker"
          description="With navigationPickerIconOnly, the title remains visible as the header while a compact calendar icon provides quick date navigation."
          centered={false}
        >
          <div style={{ height: 500, width: '100%' }}>
            <Calendar
              entries={sampleEntries}
              initialView={ViewMode.timeGridWeek}
              height="100%"
              showNavigationPicker
              navigationPickerIconOnly
              nowIndicator
            />
          </div>
        </ComponentDemo>
        <div className="mt-4">
          <CodeBlock title="Icon-Only Navigation Picker" code={iconOnlyPickerCode} />
        </div>
      </div>
    </>
  );
};

export default CustomToolbarEnd;
