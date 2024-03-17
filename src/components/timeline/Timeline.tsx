import classNames from 'classnames';
import React, { useMemo } from 'react';
import TimelineItem from './TimelineItem';
import './Timeline.scss';

type TimelineColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';
type TimelineLayout = 'vertical' | 'horizontal';
type TimelineAlign = 'left' | 'right' | 'alternate';
type TimelineConnectorStyle = 'solid' | 'dashed' | 'dotted';
type TimelineMarkerSize = 'sm' | 'md' | 'lg';

interface TimelineEvent {
    id: string;
    title: string;
    description?: React.ReactNode;
    timestamp?: string;
    icon?: React.ReactNode;
    color?: TimelineColor;
    marker?: React.ReactNode;
    content?: React.ReactNode;
}

interface TimelineProps {
    events: TimelineEvent[];
    layout?: TimelineLayout;
    align?: TimelineAlign;
    connectorStyle?: TimelineConnectorStyle;
    className?: string;
    markerSize?: TimelineMarkerSize;
}

function Timeline({
    events,
    layout = 'vertical',
    align = 'left',
    connectorStyle = 'solid',
    className,
    markerSize = 'md',
}: TimelineProps) {
    const rootClass = useMemo(
        () =>
            classNames('eui-timeline', className, {
                'eui-tl-vertical': layout === 'vertical',
                'eui-tl-horizontal': layout === 'horizontal',
                'eui-tl-left': align === 'left',
                'eui-tl-right': align === 'right',
                'eui-tl-alternate': align === 'alternate',
                [`eui-tl-connector-${connectorStyle}`]: connectorStyle !== 'solid',
                [`eui-tl-marker-${markerSize}`]: markerSize !== 'md',
            }),
        [layout, align, connectorStyle, markerSize, className]
    );

    return (
        <div className={rootClass} role="list" aria-label="Timeline">
            {events.map((event, index) => (
                <TimelineItem
                    key={event.id}
                    event={event}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === events.length - 1}
                    align={align}
                    layout={layout}
                />
            ))}
        </div>
    );
}

export { Timeline };
export type {
    TimelineEvent,
    TimelineProps,
    TimelineColor,
    TimelineLayout,
    TimelineAlign,
    TimelineConnectorStyle,
    TimelineMarkerSize,
};
