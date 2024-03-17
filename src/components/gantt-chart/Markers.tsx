import { memo, useMemo } from 'react';
import { useGanttContext } from './GanttContext';
import { getMarkerPosition } from './gantt-utils';

function Markers() {
    const { markers, startDate, columnWidth, totalHeight, viewMode } = useGanttContext();

    const markerPositions = useMemo(() => {
        if (!markers?.length) return [];

        return markers.map(marker => ({
            ...marker,
            left: getMarkerPosition(marker.date, startDate, columnWidth, viewMode),
        }));
    }, [markers, startDate, columnWidth, viewMode]);

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
                >
                    {marker.label && (
                        <div className="eui-gantt-marker-label" style={{ backgroundColor: marker.color ? `${marker.color}20` : undefined, color: marker.color }}>
                            <div className="eui-gantt-marker-arrow" style={{ borderRightColor: marker.color ? `${marker.color}20` : undefined }} />
                            {marker.label}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default memo(Markers);
