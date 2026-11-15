import { memo, useMemo } from 'react';
import classNames from 'classnames';
import { useGanttContext } from './GanttContext';
import { layoutBands } from './gantt-utils';

function Bands() {
    const { bands, startDate, columnWidth, totalHeight, viewMode } = useGanttContext();

    const positioned = useMemo(
        () => layoutBands(bands, startDate, columnWidth, viewMode),
        [bands, startDate, columnWidth, viewMode]
    );

    if (!positioned.length) return null;

    return (
        <div className="eui-gantt-bands" style={{ height: totalHeight }}>
            {positioned.map(({ band, index, left, width, order }) => (
                <div
                    key={band.id ?? index}
                    className={classNames('eui-gantt-band', band.cssClass, { 'is-alt': order % 2 === 1 })}
                    style={{ left, width, backgroundColor: band.color, borderLeftColor: band.color }}
                />
            ))}
        </div>
    );
}

export default memo(Bands);
