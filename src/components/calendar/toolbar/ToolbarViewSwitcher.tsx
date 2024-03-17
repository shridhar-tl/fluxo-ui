import React, { useState, useCallback, useRef, useEffect } from 'react';
import cn from 'classnames';
import type { CalendarViewMode, CalendarViewDefinition } from '../calendar-types';

interface ToolbarViewSwitcherProps {
  currentView: CalendarViewMode;
  views: CalendarViewDefinition[];
  onViewChange: (view: CalendarViewMode) => void;
}

const ToolbarViewSwitcher: React.FC<ToolbarViewSwitcherProps> = ({ currentView, views, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel = views.find(v => v.name === currentView)?.label ?? currentView;

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSelect = useCallback((viewName: string) => {
    onViewChange(viewName);
    setIsOpen(false);
  }, [onViewChange]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  return (
    <div className="eui-cal-toolbar-view-switcher" ref={ref} onKeyDown={handleKeyDown}>
      <button
        className="eui-cal-toolbar-btn eui-cal-toolbar-view-btn"
        onClick={handleToggle}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Switch view"
      >
        {currentLabel}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="eui-cal-toolbar-chevron">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="eui-cal-toolbar-view-dropdown" role="listbox">
          {views.map(view => (
            <button
              key={view.name}
              className={cn('eui-cal-toolbar-view-option', {
                'eui-cal-toolbar-view-option-active': view.name === currentView,
              })}
              onClick={() => handleSelect(view.name)}
              type="button"
              role="option"
              aria-selected={view.name === currentView}
            >
              {view.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ToolbarViewSwitcher);
