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
    headingLevel: 1 | 2 | 3 | 4 | 5 | 6;
}

function getItemSide(align: TimelineAlign, index: number): 'left' | 'right' {
    if (align === 'right') return 'right';
    if (align === 'alternate') return index % 2 === 0 ? 'left' : 'right';
    return 'left';
}

function TimelineItem({ event, index, isFirst, isLast, align, layout, headingLevel }: TimelineItemProps) {
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
        if (event.icon) return <span className="eui-tl-icon" aria-hidden="true">{event.icon}</span>;
        return <span className="eui-tl-dot" aria-hidden="true" />;
    }, [event.marker, event.icon]);

    const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const isClickable = !!event.onClick || !!event.href;

    const content = (
        <>
            {event.timestamp && <span className="eui-tl-timestamp">{event.timestamp}</span>}
            <HeadingTag className="eui-tl-title">{event.title}</HeadingTag>
            {event.description && <p className="eui-tl-description">{event.description}</p>}
            {event.content && <div className="eui-tl-custom-content">{event.content}</div>}
        </>
    );

    let body: React.ReactNode;
    if (event.href) {
        body = (
            <a className="eui-tl-content eui-tl-content-link" href={event.href}>
                {content}
            </a>
        );
    } else if (event.onClick) {
        body = (
            <button
                type="button"
                className="eui-tl-content eui-tl-content-button"
                onClick={event.onClick}
            >
                {content}
            </button>
        );
    } else {
        body = <div className="eui-tl-content">{content}</div>;
    }

    return (
        <li className={classNames(itemClass, { 'eui-tl-item-clickable': isClickable })}>
            <div className="eui-tl-connector-area" aria-hidden="true">
                {!isFirst && <span className="eui-tl-connector eui-tl-connector-before" />}
                <span className="eui-tl-marker">{markerContent}</span>
                {!isLast && <span className="eui-tl-connector eui-tl-connector-after" />}
            </div>
            {body}
        </li>
    );
}

export default TimelineItem;
