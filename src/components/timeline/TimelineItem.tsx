import classNames from 'classnames';
import { useMemo } from 'react';
import type { TimelineAlign, TimelineEvent, TimelineLayout } from './Timeline';

interface TimelineItemProps {
    event: TimelineEvent;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    align: TimelineAlign;
    layout: TimelineLayout;
}

function getItemSide(align: TimelineAlign, index: number): 'left' | 'right' {
    if (align === 'right') return 'right';
    if (align === 'alternate') return index % 2 === 0 ? 'left' : 'right';
    return 'left';
}

function TimelineItem({ event, index, isFirst, isLast, align, layout }: TimelineItemProps) {
    const side = getItemSide(align, index);
    const color = event.color || 'primary';

    const itemClass = useMemo(
        () =>
            classNames('eui-tl-item', {
                'eui-tl-item-first': isFirst,
                'eui-tl-item-last': isLast,
                [`eui-tl-item-${side}`]: layout === 'vertical',
                [`eui-tl-color-${color}`]: true,
            }),
        [isFirst, isLast, side, layout, color]
    );

    const markerContent = useMemo(() => {
        if (event.marker) return event.marker;
        if (event.icon) return <span className="eui-tl-icon">{event.icon}</span>;
        return <span className="eui-tl-dot" />;
    }, [event.marker, event.icon]);

    return (
        <div className={itemClass} role="listitem">
            <div className="eui-tl-connector-area">
                {!isFirst && <span className="eui-tl-connector eui-tl-connector-before" />}
                <span className="eui-tl-marker">{markerContent}</span>
                {!isLast && <span className="eui-tl-connector eui-tl-connector-after" />}
            </div>
            <div className="eui-tl-content">
                {event.timestamp && <span className="eui-tl-timestamp">{event.timestamp}</span>}
                <h4 className="eui-tl-title">{event.title}</h4>
                {event.description && <p className="eui-tl-description">{event.description}</p>}
                {event.content && <div className="eui-tl-custom-content">{event.content}</div>}
            </div>
        </div>
    );
}

export default TimelineItem;
