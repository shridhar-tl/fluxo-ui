import type { ComponentType } from 'react';
import type {
  CalendarPlugin, CalendarViewDefinition, CalendarPluginToolbarAction,
  EntryRenderer, ViewProps, DateRange, CalendarApi,
} from '../calendar-types';

export interface ViewDefinitionOptions {
  name: string;
  label: string;
  component: ComponentType<ViewProps>;
  getDateRange: (date: Date, firstDayOfWeek: number) => DateRange;
  getTitle: (dateRange: DateRange) => string;
  navigate: (date: Date, direction: 'prev' | 'next') => Date;
}

export function defineView(options: ViewDefinitionOptions): CalendarViewDefinition {
  return {
    name: options.name,
    label: options.label,
    component: options.component,
    getDateRange: options.getDateRange,
    getTitle: options.getTitle,
    navigate: options.navigate,
  };
}

export interface CreatePluginOptions {
  name: string;
  views?: CalendarViewDefinition[];
  entryRenderers?: Record<string, EntryRenderer>;
  toolbarActions?: CalendarPluginToolbarAction[];
  onInit?: (api: CalendarApi) => void;
  onDestroy?: () => void;
}

export function createViewPlugin(options: CreatePluginOptions): CalendarPlugin {
  return {
    name: options.name,
    views: options.views,
    entryRenderers: options.entryRenderers,
    toolbarActions: options.toolbarActions,
    onInit: options.onInit,
    onDestroy: options.onDestroy,
  };
}
