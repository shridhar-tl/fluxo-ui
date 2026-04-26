import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useViewport } from '../../../hooks/useMobile';
import { useCalendarContext } from '../CalendarContext';
import type { EntryRenderer, ResolvedCalendarEntry } from '../calendar-types';
import { formatTime } from '../calendar-utils';

interface OverflowPopoverProps {
  entries: ResolvedCalendarEntry[];
  triggerLabel: string;
  renderEntry?: EntryRenderer;
  onEntryClick?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  onEntryContextMenu?: (entry: ResolvedCalendarEntry, event: React.MouseEvent) => void;
  className?: string;
}

const OverflowPopover: React.FC<OverflowPopoverProps> = ({
  entries, triggerLabel, onEntryClick, onEntryContextMenu, className,
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { config } = useCalendarContext();
  const { isCompact, isMobile, isTablet } = useViewport();

  const handleOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (!isCompact) document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    if (isCompact) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = previousOverflow;
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, isCompact]);

  useEffect(() => {
    if (!open || !popoverRef.current || isCompact) return;
    const popover = popoverRef.current;
    const rect = popover.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let { top, left } = position;
    if (rect.right > vw - 8) left = vw - rect.width - 8;
    if (left < 8) left = 8;
    if (rect.bottom > vh - 8) top = position.top - rect.height - 40;
    if (top < 8) top = 8;
    if (top !== position.top || left !== position.left) {
      setPosition({ top, left });
    }
  }, [open, position, isCompact]);

  return (
    <>
      <button
        ref={triggerRef}
        className={cn('eui-cal-overflow-trigger', className)}
        onClick={handleOpen}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Show ${entries.length} more entries`}
      >
        {triggerLabel}
      </button>
      {open && (
        isCompact ? (
          createPortal(
            <div
              className={cn('eui-cal-overflow-backdrop', {
                'eui-cal-overflow-backdrop-mobile': isMobile,
                'eui-cal-overflow-backdrop-tablet': isTablet,
              })}
              onClick={() => setOpen(false)}
            >
              <div
                ref={popoverRef}
                className="eui-cal-overflow-popover eui-cal-overflow-popover-mobile"
                role="dialog"
                aria-modal="true"
                aria-label="Additional entries"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="eui-cal-overflow-popover-header">
                  <span className="eui-cal-overflow-popover-count">
                    {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                  </span>
                  <button
                    className="eui-cal-overflow-popover-close"
                    onClick={() => setOpen(false)}
                    type="button"
                    aria-label="Close"
                  >
                    <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                      <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="eui-cal-overflow-popover-list" role="list">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="eui-cal-overflow-popover-item"
                      role="listitem"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEntryClick?.(entry, e);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onEntryContextMenu?.(entry, e);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onEntryClick?.(entry, e as unknown as React.MouseEvent);
                        }
                      }}
                    >
                      <span
                        className="eui-cal-overflow-popover-dot"
                        style={{ background: entry.color || 'var(--eui-primary)' }}
                      />
                      <span className="eui-cal-overflow-popover-time">
                        {entry.allDay
                          ? config.allDayText || 'All day'
                          : config.displayEventTime ? formatTime(entry.start, config.timeFormat) : ''}
                      </span>
                      <span className="eui-cal-overflow-popover-title">{entry.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        ) : (
          <div
            ref={popoverRef}
            className="eui-cal-overflow-popover"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            role="dialog"
            aria-label="Additional entries"
          >
            <div className="eui-cal-overflow-popover-header">
              <span className="eui-cal-overflow-popover-count">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
              <button
                className="eui-cal-overflow-popover-close"
                onClick={() => setOpen(false)}
                type="button"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="eui-cal-overflow-popover-list" role="list">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="eui-cal-overflow-popover-item"
                  role="listitem"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEntryClick?.(entry, e);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onEntryContextMenu?.(entry, e);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onEntryClick?.(entry, e as unknown as React.MouseEvent);
                    }
                  }}
                >
                  <span
                    className="eui-cal-overflow-popover-dot"
                    style={{ background: entry.color || 'var(--eui-primary)' }}
                  />
                  <span className="eui-cal-overflow-popover-time">
                    {entry.allDay
                      ? config.allDayText || 'All day'
                      : config.displayEventTime ? formatTime(entry.start, config.timeFormat) : ''}
                  </span>
                  <span className="eui-cal-overflow-popover-title">{entry.title}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </>
  );
};

export default React.memo(OverflowPopover);
