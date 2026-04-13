import React, { useRef, useState } from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { CalendarApi } from '../../../components/calendar';
import { Button } from '../../../components/Button';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries, imperativeApiCode } from './calendar-story-data';

const ImperativeApi: React.FC = () => {
  const apiRef = useRef<CalendarApi>(null);
  const [viewInfo, setViewInfo] = useState('');

  return (
    <>
      <ComponentDemo title="Imperative API" description="Control the calendar programmatically using a ref." centered={false}>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button label="Previous" size="xs" layout="outlined" onClick={() => apiRef.current?.prev()} />
          <Button label="Today" size="xs" variant="primary" onClick={() => apiRef.current?.today()} />
          <Button label="Next" size="xs" layout="outlined" onClick={() => apiRef.current?.next()} />
          <Button label="Month View" size="xs" layout="outlined" onClick={() => apiRef.current?.changeView(ViewMode.dayGridMonth)} />
          <Button label="Week View" size="xs" layout="outlined" onClick={() => apiRef.current?.changeView(ViewMode.timeGridWeek)} />
          <Button label="Day View" size="xs" layout="outlined" onClick={() => apiRef.current?.changeView(ViewMode.timeGridDay)} />
          <Button
            label="Get View Info"
            size="xs"
            variant="info"
            onClick={() => {
              const info = apiRef.current?.getView();
              if (info) setViewInfo(`${info.mode}: ${info.title}`);
            }}
          />
        </div>
        {viewInfo && (
          <div className="mb-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
            {viewInfo}
          </div>
        )}
        <div style={{ height: 500, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.timeGridWeek}
            height="100%"
            apiRef={apiRef}
            nowIndicator
          />
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Imperative API" code={imperativeApiCode} />
      </div>
    </>
  );
};

export default ImperativeApi;
