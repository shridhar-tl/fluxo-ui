import type { CalendarPlugin } from '../calendar-types';
import { createAgendaViewDef } from '../views/agenda';

export interface AgendaPluginOptions {
  dayCount?: number;
  label?: string;
}

export function agendaPlugin(options?: AgendaPluginOptions): CalendarPlugin {
  const viewDef = createAgendaViewDef(options?.dayCount, options?.label);
  return {
    name: 'agenda',
    views: [viewDef],
  };
}
