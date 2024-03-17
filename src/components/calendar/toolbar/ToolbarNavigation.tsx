import React from 'react';

interface ToolbarNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const ToolbarNavigation: React.FC<ToolbarNavigationProps> = ({ onPrev, onNext, onToday }) => {
  return (
    <div className="eui-cal-toolbar-nav">
      <button
        className="eui-cal-toolbar-btn"
        onClick={onToday}
        type="button"
        aria-label="Go to today"
      >
        Today
      </button>
      <button
        className="eui-cal-toolbar-btn eui-cal-toolbar-btn-icon"
        onClick={onPrev}
        type="button"
        aria-label="Previous period"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        className="eui-cal-toolbar-btn eui-cal-toolbar-btn-icon"
        onClick={onNext}
        type="button"
        aria-label="Next period"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default React.memo(ToolbarNavigation);
