import { memo, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { useGanttContext } from './GanttContext';
import { generateWeekGroups, generateSecondaryHeaders } from './gantt-utils';

interface TimelineHeaderProps {
    headerRef: React.RefObject<HTMLDivElement | null>;
    measureRef?: React.RefObject<HTMLDivElement | null>;
}

function TimelineHeader({ headerRef, measureRef }: TimelineHeaderProps) {
    const { dateCells, viewMode, columnWidth, totalWidth } = useGanttContext();

    const primaryGroups = useMemo(
        () => generateWeekGroups(dateCells, viewMode),
        [dateCells, viewMode]
    );

    const secondaryHeaders = useMemo(
        () => generateSecondaryHeaders(dateCells, viewMode),
        [dateCells, viewMode]
    );

    const setRefs = useCallback((el: HTMLDivElement | null) => {
        (headerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        if (measureRef) {
            (measureRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }
    }, [headerRef, measureRef]);

    return (
        <div className="eui-gantt-timeline-header" ref={setRefs}>
            <div className="eui-gantt-timeline-header-primary" style={{ width: totalWidth }}>
                {primaryGroups.map((group, i) => (
                    <div
                        key={`${group.label}-${i}`}
                        className="eui-gantt-header-group-cell"
                        style={{ width: group.span * columnWidth }}
                    >
                        {group.label}
                    </div>
                ))}
            </div>
            <div className="eui-gantt-timeline-header-secondary" style={{ width: totalWidth }}>
                {viewMode === 'day' ? (
                    dateCells.map(cell => (
                        <div
                            key={cell.dateStr}
                            className={classNames('eui-gantt-header-day-cell', {
                                'is-weekend': cell.isWeekend,
                                'is-today': cell.isToday,
                                'is-holiday': cell.isHoliday,
                            })}
                            style={{ width: columnWidth }}
                        >
                            <span className="eui-gantt-day-num">{cell.dayNum}</span>
                            <span className="eui-gantt-day-name">{cell.dayName}</span>
                        </div>
                    ))
                ) : (
                    secondaryHeaders.map((header, i) => (
                        <div
                            key={`${header.label}-${i}`}
                            className="eui-gantt-header-secondary-cell"
                            style={{ width: header.span * columnWidth }}
                        >
                            {header.label}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default memo(TimelineHeader);
