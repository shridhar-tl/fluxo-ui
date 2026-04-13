import React from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries, sampleDateBackgrounds, sampleDateRangeBackgrounds, dateBackgroundCode } from './calendar-story-data';

const DateBackgrounds: React.FC = () => {
  return (
    <>
      <ComponentDemo title="Date Backgrounds" description="Highlight specific dates or date ranges with custom background colors. Works across all views." centered={false}>
        <div style={{ height: 550, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.timeGridWeek}
            height="100%"
            nowIndicator
            dateBackgrounds={sampleDateBackgrounds}
            dateRangeBackgrounds={sampleDateRangeBackgrounds}
          />
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Date Backgrounds" code={dateBackgroundCode} />
      </div>
    </>
  );
};

export default DateBackgrounds;
