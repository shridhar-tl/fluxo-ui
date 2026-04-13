import React from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries } from './calendar-story-data';

const navPickerCode = `<Calendar
  entries={entries}
  initialView="timeGridWeek"
  showNavigationPicker
  firstDayOfWeek={1}
  nowIndicator
/>

// The picker auto-selects the right mode:
// - Month views → month picker
// - Week views → week picker
// - Day views → day picker`;

const NavigationPickerDemo: React.FC = () => {
  return (
    <>
      <ComponentDemo
        title="Navigation Picker"
        description="Enable showNavigationPicker to add a date range picker in the toolbar. It auto-selects week/month/day mode based on the current view. Try switching views to see the picker mode change."
        centered={false}
      >
        <div style={{ height: 550, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.timeGridWeek}
            height="100%"
            showNavigationPicker
            firstDayOfWeek={1}
            nowIndicator
          />
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Navigation Picker" code={navPickerCode} />
      </div>
    </>
  );
};

export default NavigationPickerDemo;
