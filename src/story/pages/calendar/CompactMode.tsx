import React from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleEntries } from './calendar-story-data';

const CompactMode: React.FC = () => {
  return (
    <ComponentDemo title="Compact & Embedded Mode" description="Use compact mode for embedding in sidebars or dashboards. Hide toolbar sections as needed." centered={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ width: '100%' }}>
        <div>
          <h4 className="text-sm font-semibold mb-2">Compact Mode</h4>
          <div style={{ height: 350, width: '100%' }}>
            <Calendar
              entries={sampleEntries}
              initialView={ViewMode.dayGridMonth}
              height="100%"
              compact
              nowIndicator={false}
            />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2">Hidden Toolbar Sections</h4>
          <div style={{ height: 350, width: '100%' }}>
            <Calendar
              entries={sampleEntries}
              initialView={ViewMode.listWeek}
              height="100%"
              hideToolbarViewSwitcher
              hideToolbarNavigation={false}
            />
          </div>
        </div>
      </div>
    </ComponentDemo>
  );
};

export default CompactMode;
