import React from 'react';
import cn from 'classnames';
import type { CalendarNavigationLayout } from '../calendar-types';
import '../../eui-base.scss';
import './ToolbarButton.scss';

export interface CalendarNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  layout?: CalendarNavigationLayout;
  className?: string;
}

const ToolbarNavigation: React.FC<CalendarNavigationProps> = ({ onPrev, onNext, onToday, layout = 'today-first', className }) => {
  const todayButton = (
    <button className="eui-cal-toolbar-btn" onClick={onToday} type="button" aria-label="Go to today">
      Today
    </button>
  );

  return (
    <div className={cn('eui-cal-toolbar-nav', className)} role="group" aria-label="Calendar navigation">
      {layout === 'today-first' && todayButton}
      <button
        className="eui-cal-toolbar-btn eui-cal-toolbar-btn-icon"
        onClick={onPrev}
        type="button"
        aria-label="Previous period"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {layout === 'today-between' && todayButton}
      <button
        className="eui-cal-toolbar-btn eui-cal-toolbar-btn-icon"
        onClick={onNext}
        type="button"
        aria-label="Next period"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default React.memo(ToolbarNavigation);
