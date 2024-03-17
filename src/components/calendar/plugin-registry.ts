import type {
  CalendarPlugin, CalendarViewDefinition, EntryRenderer,
  CalendarPluginToolbarAction, CalendarApi,
} from './calendar-types';

export class PluginRegistry {
  private plugins: CalendarPlugin[] = [];
  private viewMap = new Map<string, CalendarViewDefinition>();
  private rendererMap = new Map<string, EntryRenderer>();
  private toolbarActions: CalendarPluginToolbarAction[] = [];

  register(plugin: CalendarPlugin): void {
    this.plugins.push(plugin);

    if (plugin.views) {
      for (const view of plugin.views) {
        this.viewMap.set(view.name, view);
      }
    }

    if (plugin.entryRenderers) {
      for (const [type, renderer] of Object.entries(plugin.entryRenderers)) {
        this.rendererMap.set(type, renderer);
      }
    }

    if (plugin.toolbarActions) {
      this.toolbarActions.push(...plugin.toolbarActions);
    }
  }

  registerView(view: CalendarViewDefinition): void {
    this.viewMap.set(view.name, view);
  }

  getView(name: string): CalendarViewDefinition | undefined {
    return this.viewMap.get(name);
  }

  getAllViews(): Map<string, CalendarViewDefinition> {
    return new Map(this.viewMap);
  }

  getViewList(): CalendarViewDefinition[] {
    return Array.from(this.viewMap.values());
  }

  getEntryRenderer(type: string): EntryRenderer | undefined {
    return this.rendererMap.get(type);
  }

  getToolbarActions(): CalendarPluginToolbarAction[] {
    return [...this.toolbarActions];
  }

  initPlugins(api: CalendarApi): void {
    for (const plugin of this.plugins) {
      plugin.onInit?.(api);
    }
  }

  destroyPlugins(): void {
    for (const plugin of this.plugins) {
      plugin.onDestroy?.();
    }
  }

  clear(): void {
    this.destroyPlugins();
    this.plugins = [];
    this.viewMap.clear();
    this.rendererMap.clear();
    this.toolbarActions = [];
  }
}
