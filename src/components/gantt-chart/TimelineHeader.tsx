import { memo, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { useGanttContext } from './GanttContext';
import { generateWeekGroups, generateSecondaryHeaders, getMarkerPosition, layoutBands, layoutTimelineLabels, fitBandLabel } from './gantt-utils';

const maxMarkerLanes = 2;
const markerLaneHeight = 18;
const bandLaneHeight = 20;
const bandLabelPadding = 14;

interface TimelineHeaderProps {
    headerRef: React.RefObject<HTMLDivElement | null>;
    measureRef?: React.RefObject<HTMLDivElement | null>;
}

function TimelineHeader({ headerRef, measureRef }: TimelineHeaderProps) {
    const { dateCells, viewMode, columnWidth, totalWidth, markers, bands, startDate } = useGanttContext();

    const primaryGroups = useMemo(
        () => generateWeekGroups(dateCells, viewMode),
        [dateCells, viewMode]
    );

    const secondaryHeaders = useMemo(
        () => generateSecondaryHeaders(dateCells, viewMode),
        [dateCells, viewMode]
    );

    const bandLabels = useMemo(
        () =>
            layoutBands(bands, startDate, columnWidth, viewMode)
                .filter(item => item.band.label && item.width > 0)
                .map(item => ({ ...item, text: fitBandLabel(item.band, item.width, bandLabelPadding) })),
        [bands, startDate, columnWidth, viewMode]
    );

    const bandLanes = bandLabels.length ? Math.max(...bandLabels.map(item => item.lane + 1)) : 0;

    const markerLabels = useMemo(() => {
        const colors = new Map<string, string | undefined>();
        const labels = markers
            .map((marker, i) => {
                const id = marker.id ?? String(i);
                colors.set(id, marker.color);
                return { id, text: marker.label || '', left: getMarkerPosition(marker.date, startDate, columnWidth, viewMode) };
            })
            .filter(label => label.text && label.left >= 0 && label.left <= totalWidth);
        return layoutTimelineLabels(labels, maxMarkerLanes).map(label => ({ ...label, color: colors.get(label.id) }));
    }, [markers, startDate, columnWidth, viewMode, totalWidth]);

    const markerLanes = markerLabels.length ? Math.max(1, ...markerLabels.map(label => label.lane + 1)) : 0;

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
            {bandLabels.length > 0 && (
                <div className="eui-gantt-timeline-header-bands" style={{ width: totalWidth, height: bandLanes * bandLaneHeight + 4 }}>
                    {bandLabels.map(({ band, index, left, width, lane, order, text }) => (
                        <div
                            key={band.id ?? index}
                            className={classNames('eui-gantt-header-band', band.cssClass, { 'is-alt': order % 2 === 1 })}
                            style={{ left, width, top: lane * bandLaneHeight + 2, borderLeftColor: band.color }}
                            title={band.label}
                        >
                            <span className="eui-gantt-header-band-fill" style={{ backgroundColor: band.color }} />
                            <span className="eui-gantt-header-band-label">{text}</span>
                        </div>
                    ))}
                </div>
            )}
            {markerLabels.length > 0 && (
                <div className="eui-gantt-timeline-header-markers" style={{ width: totalWidth, height: markerLanes * markerLaneHeight + 4 }}>
                    {markerLabels.map(label =>
                        label.lane >= 0 ? (
                            <div
                                key={label.id}
                                className="eui-gantt-header-marker"
                                style={{ left: label.left, top: label.lane * markerLaneHeight + 2, maxWidth: label.width, color: label.color, borderLeftColor: label.color }}
                                title={label.text}
                            >
                                {label.text}
                            </div>
                        ) : (
                            <div
                                key={label.id}
                                className="eui-gantt-header-marker-more"
                                style={{ left: label.left - 4, borderTopColor: label.color }}
                                title={label.text}
                                aria-label={label.text}
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default memo(TimelineHeader);
