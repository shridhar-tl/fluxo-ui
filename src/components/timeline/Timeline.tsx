import classNames from 'classnames';
import React, { useMemo } from 'react';
import TimelineItem from './TimelineItem';
import '../eui-base.scss';
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
    href?: string;
    onClick?: () => void;
}

interface TimelineProps {
    events: TimelineEvent[];
    layout?: TimelineLayout;
    align?: TimelineAlign;
    connectorStyle?: TimelineConnectorStyle;
    className?: string;
    markerSize?: TimelineMarkerSize;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    ariaLabel?: string;
}

function Timeline({
    events,
    layout = 'vertical',
    align = 'left',
    connectorStyle = 'solid',
    className,
    markerSize = 'md',
    headingLevel = 4,
    ariaLabel = 'Timeline',
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
        <ol
            className={rootClass}
            aria-label={ariaLabel}
            aria-roledescription="timeline"
        >
            {events.map((event, index) => (
                <TimelineItem
                    key={event.id}
                    event={event}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === events.length - 1}
                    align={align}
                    layout={layout}
                    headingLevel={headingLevel}
                />
            ))}
        </ol>
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
