import { useEffect, useRef } from 'react';
import { hasOpenLayer } from '../../../utils/layer-stack';
import type { CalendarKeyboardShortcuts } from '../calendar-types';

interface ShortcutActions {
  prev: () => void;
  next: () => void;
  today: () => void;
}

const shortcutKeys: Record<string, keyof ShortcutActions> = {
  ArrowLeft: 'prev',
  ArrowRight: 'next',
  k: 'prev',
  K: 'prev',
  j: 'next',
  J: 'next',
  t: 'today',
  T: 'today',
};

const compositeWidgetSelector =
  '[role="listbox"],[role="menu"],[role="menubar"],[role="radiogroup"],[role="tablist"],[role="slider"],[role="grid"],[role="tree"],[role="treegrid"],[role="spinbutton"],[role="combobox"],[role="textbox"]';

const ownsKeyboard = (target: EventTarget | null, container: HTMLElement): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  const widget = target.closest(compositeWidgetSelector);
  return !!widget && !container.contains(widget);
};

export const useCalendarShortcuts = (
  mode: CalendarKeyboardShortcuts | undefined,
  containerRef: React.RefObject<HTMLElement | null>,
  actions: ShortcutActions,
) => {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    if (!mode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const action = shortcutKeys[event.key];
      if (!action) return;
      if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
      const container = containerRef.current;
      if (!container || container.offsetParent === null) return;
      if (mode === 'focus-within' && !container.contains(event.target as Node)) return;
      if (ownsKeyboard(event.target, container) || hasOpenLayer()) return;
      event.preventDefault();
      actionsRef.current[action]();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, containerRef]);
};
