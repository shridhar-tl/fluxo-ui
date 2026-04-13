import React from 'react';
import { Calendar, ViewMode } from '../../../components/calendar';
import type { ResolvedCalendarEntry, EntryRenderContext } from '../../../components/calendar';
import { ComponentDemo } from '../../ComponentDemo';
import { CodeBlock } from '../../CodeBlock';
import { sampleEntries, customRenderCode } from './calendar-story-data';

const typeIcons: Record<string, string> = {
  meeting: '\uD83D\uDCE5',
  task: '\u2705',
  personal: '\uD83C\uDFE0',
  event: '\uD83C\uDF89',
  deadline: '\u26A0\uFE0F',
};

function renderCustomEntry(entry: ResolvedCalendarEntry, context: EntryRenderContext) {
  const icon = typeIcons[String(entry.entryType)] ?? '\uD83D\uDCC5';
  return (
    <div style={{ padding: '1px 2px', display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: context.isCompact ? '0.65rem' : '0.75rem', flexShrink: 0 }}>{icon}</span>
      <span style={{
        fontWeight: 600,
        fontSize: context.isCompact ? '0.65rem' : '0.75rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {entry.title}
      </span>
    </div>
  );
}

const CustomRendering: React.FC = () => {
  return (
    <>
      <ComponentDemo title="Custom Entry Rendering" description="Use renderEntry to fully control entry appearance with icons and custom layouts." centered={false}>
        <div style={{ height: 550, width: '100%' }}>
          <Calendar
            entries={sampleEntries}
            initialView={ViewMode.timeGridWeek}
            height="100%"
            renderEntry={renderCustomEntry}
            nowIndicator
          />
        </div>
      </ComponentDemo>
      <div className="mt-4">
        <CodeBlock title="Custom Render" code={customRenderCode} />
      </div>
    </>
  );
};

export default CustomRendering;
