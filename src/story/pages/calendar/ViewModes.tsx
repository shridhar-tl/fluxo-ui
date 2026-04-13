import React, { useRef, useState } from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { CalendarApi, CalendarViewMode } from '../../../components/calendar';
import { Button } from '../../../components/Button';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleEntries } from './calendar-story-data';

const viewOptions: { label: string; value: CalendarViewMode }[] = [
  { label: 'Month Grid', value: ViewMode.dayGridMonth },
  { label: 'Week Time Grid', value: ViewMode.timeGridWeek },
  { label: 'Day Time Grid', value: ViewMode.timeGridDay },
  { label: 'Week Day Grid', value: ViewMode.dayGridWeek },
  { label: 'Day Grid', value: ViewMode.dayGridDay },
  { label: 'Month List', value: ViewMode.listMonth },
  { label: 'Week List', value: ViewMode.listWeek },
  { label: 'Day List', value: ViewMode.listDay },
  { label: 'Multi-Month', value: ViewMode.multiMonth },
  { label: 'Scroll Month', value: ViewMode.scrollMonth },
];

const ViewModes: React.FC = () => {
  const apiRef = useRef<CalendarApi>(null);
  const [currentView, setCurrentView] = useState<CalendarViewMode>(ViewMode.timeGridWeek);

  return (
    <ComponentDemo title="View Modes" description="All 8 built-in view modes. Click buttons to switch." centered={false}>
      <div className="flex flex-wrap gap-2 mb-4">
        {viewOptions.map(opt => (
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
          nowIndicator
          onViewChange={setCurrentView}
        />
      </div>
    </ComponentDemo>
  );
};

export default ViewModes;
