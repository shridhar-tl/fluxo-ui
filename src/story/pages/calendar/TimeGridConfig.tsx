import React, { useState } from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import { Dropdown } from '../../../components/Dropdown';
import { InputSwitch } from '../../../components/InputSwitch';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries, configCode } from './calendar-story-data';

const slotOptions = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
];

const formatOptions = [
  { label: '12h', value: '12h' },
  { label: '24h', value: '24h' },
];

const TimeGridConfig: React.FC = () => {
  const [slotDuration, setSlotDuration] = useState(30);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [rowBanding, setRowBanding] = useState(false);

  return (
    <>
      <ComponentDemo title="Time Grid Configuration" description="Configure slot duration, visible hours, business hours, time format, and more." centered={false}>
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Slot:</span>
            <Dropdown
              value={slotDuration}
              options={slotOptions}
              onChange={(e) => setSlotDuration(e.value)}
              size="sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Format:</span>
            <Dropdown
              value={timeFormat}
              options={formatOptions}
              onChange={(e) => setTimeFormat(e.value)}
              size="sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Row Banding:</span>
            <InputSwitch checked={rowBanding} onChange={(e) => setRowBanding(e.value)} />
          </div>
        </div>
        <div style={{ height: 550, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.timeGridWeek}
            height="100%"
            slotDuration={slotDuration}
            visibleHoursStart={7}
            visibleHoursEnd={21}
            timeFormat={timeFormat}
            rowBanding={rowBanding}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: '09:00',
              endTime: '17:00',
            }}
            nowIndicator
          />
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Configuration" code={configCode} />
      </div>
    </>
  );
};

export default TimeGridConfig;
