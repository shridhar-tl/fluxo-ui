import { memo, useMemo } from 'react';
import classNames from 'classnames';
import { useGanttContext } from './GanttContext';

function TimelineGrid() {
    const {
        dateCells, columnWidth, totalWidth, totalHeight,
        todayColumnIndex, weekendColor, holidayColor, todayColor,
        viewMode,
    } = useGanttContext();

    const gridLines = useMemo(() => {
        if (viewMode !== 'day' && viewMode !== 'week') {
            return dateCells.map((cell, i) => ({
                left: i * columnWidth,
                isToday: cell.isToday,
                isWeekend: false,
                isHoliday: false,
            }));
        }

        return dateCells.map((cell, i) => ({
            left: i * columnWidth,
            isToday: cell.isToday,
            isWeekend: cell.isWeekend,
            isHoliday: cell.isHoliday,
        }));
    }, [dateCells, columnWidth, viewMode]);

    return (
        <div className="eui-gantt-grid" style={{ width: totalWidth, height: totalHeight }}>
            {gridLines.map((line, i) => (
                <div
                    key={i}
                    className={classNames('eui-gantt-grid-cell', {
                        'is-weekend': line.isWeekend,
                        'is-holiday': line.isHoliday,
                        'is-today': line.isToday,
                    })}
                    style={{
                        left: line.left,
                        width: columnWidth,
                        height: '100%',
                        backgroundColor: line.isToday
                            ? todayColor
                            : line.isHoliday
                                ? holidayColor
                                : line.isWeekend
                                    ? weekendColor
                                    : undefined,
                    }}
                />
            ))}
            {todayColumnIndex >= 0 && (
                <div
                    className="eui-gantt-today-line"
                    style={{ left: todayColumnIndex * columnWidth + columnWidth / 2 }}
                />
            )}
        </div>
    );
}

export default memo(TimelineGrid);
