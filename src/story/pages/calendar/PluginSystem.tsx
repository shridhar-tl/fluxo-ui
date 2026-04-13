import React, { useState, useRef } from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { CalendarPlugin } from '../../../components/calendar';
import { defaultPlugins } from '../../../components/calendar/plugins';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries, pluginSystemCode } from './calendar-story-data';

const PluginSystem: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const initCalled = useRef(false);

  const [demoPlugin] = useState<CalendarPlugin>(() => ({
    name: 'demo-toolbar-plugin',
    toolbarActions: [
      {
        id: 'count-entries',
        label: 'Count',
        position: 'end',
        onClick: (api) => {
          const count = api.getEntries().length;
          setLog(prev => [...prev.slice(-4), `Visible entries: ${count}`]);
        },
      },
    ],
    onInit: () => {
      if (initCalled.current) return;
      initCalled.current = true;
      setLog(prev => [...prev, 'Plugin initialized']);
    },
  }));

  return (
    <>
      <ComponentDemo title="Plugin System" description="Extend the calendar with custom plugins that add toolbar actions, views, and entry renderers." centered={false}>
        <div style={{ height: 400, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.timeGridWeek}
            height="100%"
            plugins={[...defaultPlugins, demoPlugin]}
            nowIndicator
          />
        </div>
        {log.length > 0 && (
          <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono space-y-1">
            {log.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        )}
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Plugin System" code={pluginSystemCode} />
      </div>
    </>
  );
};

export default PluginSystem;
