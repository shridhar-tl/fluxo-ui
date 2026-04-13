import React from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries, basicCalendarCode } from './calendar-story-data';

const BasicUsage: React.FC = () => {
  return (
    <>
      <ComponentDemo title="Basic Calendar" description="A fully interactive calendar with default configuration." centered={false}>
        <div style={{ height: 600, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.timeGridWeek}
            height="100%"
            editable
            selectable
            nowIndicator
            showNavigationPicker
            onEntryClick={(entry) => alert(`Clicked: ${entry.title}`)}
            onDateSelect={(info) => alert(`Selected: ${info.start.toLocaleTimeString()} - ${info.end.toLocaleTimeString()}`)}
          />
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Basic Usage" code={basicCalendarCode} />
      </div>
    </>
  );
};

export default BasicUsage;
