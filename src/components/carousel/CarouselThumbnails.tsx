import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { CarouselSlideData } from './CarouselSlide';

interface CarouselThumbnailAction {
    icon: React.ReactNode;
    label: string;
    onClick: (slide: CarouselSlideData, index: number) => void;
    variant?: 'default' | 'danger';
    isVisible?: (slide: CarouselSlideData, index: number) => boolean;
}

interface CarouselTrailingThumbnail {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

interface CarouselThumbnailsProps {
    slides: CarouselSlideData[];
    activeIndex: number;
    position: 'top' | 'bottom' | 'left' | 'right';
    onSelect: (index: number) => void;
    showInfo?: boolean;
    actions?: CarouselThumbnailAction[];
    trailingThumbnail?: CarouselTrailingThumbnail;
}

const playIconSvg = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="eui-carousel-thumb-play-icon">
        <path d="M8 5v14l11-7z" />
    </svg>
);

function getThumbnailSrc(slide: CarouselSlideData): string | undefined {
    if (slide.thumbnail) return slide.thumbnail;
    if (slide.type === 'image') return slide.src;
    if (slide.type === 'video' && slide.videoId) {
        return `https://img.youtube.com/vi/${slide.videoId}/mqdefault.jpg`;
    }
    return undefined;
}

function CarouselThumbnails({
    slides,
    activeIndex,
    position,
    onSelect,
    showInfo = false,
    actions,
    trailingThumbnail,
}: CarouselThumbnailsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isVertical = position === 'left' || position === 'right';

    useEffect(() => {
        if (!containerRef.current) return;
        const activeThumb = containerRef.current.children[activeIndex] as HTMLElement;
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }, [activeIndex]);

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
        const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

        if (e.key === nextKey && index < slides.length - 1) {
            e.preventDefault();
            onSelect(index + 1);
        } else if (e.key === prevKey && index > 0) {
            e.preventDefault();
            onSelect(index - 1);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(index);
        }
    };

    return (
        <div
            ref={containerRef}
            className={classNames('eui-carousel-thumbnails', `eui-carousel-thumbnails-${position}`)}
            role="tablist"
            aria-label="Slide thumbnails"
            aria-orientation={isVertical ? 'vertical' : 'horizontal'}
        >
            {slides.map((slide, index) => {
                const thumbSrc = getThumbnailSrc(slide);
                const isActive = index === activeIndex;
                const visibleActions = (actions ?? []).filter(
                    (action) => !action.isVisible || action.isVisible(slide, index),
                );

                return (
                    <div
                        key={slide.id}
                        className={classNames('eui-carousel-thumb-cell', {
                            'eui-carousel-thumb-cell-with-info': showInfo && (slide.name || slide.description),
                        })}
                    >
                        <button
                            className={classNames('eui-carousel-thumb', {
                                'eui-carousel-thumb-active': isActive,
                                'eui-carousel-thumb-with-info': showInfo && (slide.name || slide.description),
                            })}
                            onClick={() => onSelect(index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            role="tab"
                            aria-selected={isActive}
                            aria-label={slide.name || slide.alt || `Slide ${index + 1}`}
                            tabIndex={isActive ? 0 : -1}
                            type="button"
                        >
                            <div className="eui-carousel-thumb-media">
                                {thumbSrc ? (
                                    <img
                                        src={thumbSrc}
                                        alt={slide.alt || `Thumbnail ${index + 1}`}
                                        className="eui-carousel-thumb-img"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="eui-carousel-thumb-placeholder">
                                        {index + 1}
                                    </div>
                                )}
                                {slide.type === 'video' && (
                                    <span className="eui-carousel-thumb-overlay">
                                        {playIconSvg}
                                    </span>
                                )}
                            </div>
                            {showInfo && (slide.name || slide.description) && (
                                <div className="eui-carousel-thumb-info">
                                    {slide.name && (
                                        <span className="eui-carousel-thumb-name" title={slide.name}>{slide.name}</span>
                                    )}
                                    {slide.description && (
                                        <span className="eui-carousel-thumb-desc" title={slide.description}>{slide.description}</span>
                                    )}
                                </div>
                            )}
                        </button>
                        {visibleActions.length > 0 && (
                            <div className="eui-carousel-thumb-actions">
                                {visibleActions.map((action) => (
                                    <button
                                        key={action.label}
                                        className={classNames('eui-carousel-thumb-action', {
                                            'eui-carousel-thumb-action-danger': action.variant === 'danger',
                                        })}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            action.onClick(slide, index);
                                        }}
                                        aria-label={`${action.label}: ${slide.name || slide.alt || `slide ${index + 1}`}`}
                                        title={action.label}
                                        type="button"
                                    >
                                        {action.icon}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
            {trailingThumbnail && (
                <div className="eui-carousel-thumb-cell eui-carousel-thumb-cell-trailing">
                    <button
                        className="eui-carousel-thumb eui-carousel-thumb-trailing"
                        onClick={trailingThumbnail.onClick}
                        aria-label={trailingThumbnail.label}
                        title={trailingThumbnail.label}
                        type="button"
                    >
                        <span className="eui-carousel-thumb-trailing-icon" aria-hidden="true">
                            {trailingThumbnail.icon}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default CarouselThumbnails;
export type { CarouselThumbnailAction, CarouselTrailingThumbnail };
