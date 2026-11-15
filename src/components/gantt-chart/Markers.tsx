import { memo, useMemo } from 'react';
import { useGanttContext } from './GanttContext';
import { getMarkerPosition } from './gantt-utils';

function Markers() {
    const { markers, startDate, columnWidth, totalHeight, totalWidth, viewMode } = useGanttContext();

    const markerPositions = useMemo(() => {
        if (!markers?.length) return [];

        return markers
            .map(marker => ({
                ...marker,
                left: getMarkerPosition(marker.date, startDate, columnWidth, viewMode),
            }))
            .filter(marker => marker.left >= 0 && marker.left <= totalWidth);
    }, [markers, startDate, columnWidth, totalWidth, viewMode]);

    if (!markerPositions.length) return null;

    return (
        <div className="eui-gantt-markers" style={{ height: totalHeight }}>
            {markerPositions.map((marker, i) => (
                <div
                    key={marker.id ?? i}
                    className={`eui-gantt-marker ${marker.cssClass ?? ''}`}
                    style={{
                        left: marker.left,
                        height: '100%',
                        borderLeftColor: marker.color,
                    }}
                />
            ))}
        </div>
    );
}

export default memo(Markers);
