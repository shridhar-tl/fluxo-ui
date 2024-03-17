import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import CarouselSlideRenderer from './CarouselSlide';
import type { CarouselSlideData } from './CarouselSlide';
import CarouselThumbnails from './CarouselThumbnails';
import './Carousel.scss';

interface CarouselSlide {
    id: string;
    type: 'image' | 'video' | 'custom';
    src?: string;
    alt?: string;
    videoId?: string;
    thumbnail?: string;
    content?: React.ReactNode;
    name?: string;
    description?: string;
}

type ThumbnailMode = 'inline' | 'hamburger';

interface CarouselProps {
    slides: CarouselSlide[];
    activeIndex?: number;
    onSlideChange?: (index: number) => void;
    navigation?: 'dots' | 'arrows' | 'thumbnails' | 'none';
    thumbnailPosition?: 'top' | 'bottom' | 'left' | 'right';
    thumbnailMode?: ThumbnailMode;
    showThumbnailInfo?: boolean;
    autoplay?: boolean;
    autoplayInterval?: number;
    loop?: boolean;
    showArrows?: boolean;
    showDots?: boolean;
    lazyLoad?: boolean;
    swipeable?: boolean;
    className?: string;
    slideClassName?: string;
    aspectRatio?: string;
}

const arrowLeftSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const arrowRightSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 6 15 12 9 18" />
    </svg>
);

function Carousel({
    slides,
    activeIndex: controlledIndex,
    onSlideChange,
    navigation = 'dots',
    thumbnailPosition = 'bottom',
    thumbnailMode = 'inline',
    showThumbnailInfo = false,
    autoplay = false,
    autoplayInterval = 5000,
    loop = false,
    showArrows = true,
    showDots,
    lazyLoad = false,
    swipeable = true,
    className,
    slideClassName,
    aspectRatio,
}: CarouselProps) {
    const [internalIndex, setInternalIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);
    const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const autoplayTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);

    const isControlled = controlledIndex !== undefined;
    const currentIndex = isControlled ? controlledIndex : internalIndex;
    const slideCount = slides.length;

    const dotsVisible = showDots !== undefined ? showDots : navigation === 'dots';
    const arrowsVisible = showArrows !== undefined ? showArrows : navigation === 'arrows' || navigation === 'thumbnails';
    const thumbnailsVisible = navigation === 'thumbnails';

    const goTo = useCallback((index: number) => {
        let nextIndex = index;
        if (loop) {
            nextIndex = ((index % slideCount) + slideCount) % slideCount;
        } else {
            nextIndex = Math.max(0, Math.min(index, slideCount - 1));
        }

        if (nextIndex === currentIndex) return;

        setIsTransitioning(true);
        if (!isControlled) {
            setInternalIndex(nextIndex);
        }
        onSlideChange?.(nextIndex);
    }, [currentIndex, isControlled, loop, onSlideChange, slideCount]);

    const goNext = useCallback(() => {
        if (!loop && currentIndex >= slideCount - 1) return;
        goTo(currentIndex + 1);
    }, [currentIndex, goTo, loop, slideCount]);

    const goPrev = useCallback(() => {
        if (!loop && currentIndex <= 0) return;
        goTo(currentIndex - 1);
    }, [currentIndex, goTo, loop]);

    useEffect(() => {
        if (isTransitioning) {
            const timer = setTimeout(() => setIsTransitioning(false), 400);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning, currentIndex]);

    useEffect(() => {
        if (autoplay && !isPaused && slideCount > 1) {
            autoplayTimerRef.current = setInterval(goNext, autoplayInterval);
            return () => clearInterval(autoplayTimerRef.current);
        }
        return () => clearInterval(autoplayTimerRef.current);
    }, [autoplay, autoplayInterval, goNext, isPaused, slideCount]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goNext();
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [goNext, goPrev]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!swipeable) return;
        pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }, [swipeable]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!swipeable || !pointerStartRef.current) return;

        const dx = e.clientX - pointerStartRef.current.x;
        const dy = e.clientY - pointerStartRef.current.y;
        const dt = Date.now() - pointerStartRef.current.time;
        pointerStartRef.current = null;

        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > absDy && (absDx > 50 || (absDx > 20 && dt < 300))) {
            if (dx < 0) {
                goNext();
            } else {
                goPrev();
            }
        }
    }, [swipeable, goNext, goPrev]);

    const handlePointerCancel = useCallback(() => {
        pointerStartRef.current = null;
    }, []);

    const trackStyle: React.CSSProperties = useMemo(() => ({
        transform: `translateX(-${currentIndex * 100}%)`,
        transition: isTransitioning ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
    }), [currentIndex, isTransitioning]);

    const canGoPrev = loop || currentIndex > 0;
    const canGoNext = loop || currentIndex < slideCount - 1;

    const layoutClass = thumbnailsVisible && thumbnailMode === 'inline'
        ? `eui-carousel-layout-${thumbnailPosition}`
        : undefined;

    const handleHamburgerSelect = useCallback((index: number) => {
        goTo(index);
        setHamburgerOpen(false);
    }, [goTo]);

    const renderThumbnails = (pos: 'top' | 'bottom' | 'left' | 'right') => (
        <CarouselThumbnails
            slides={slides as CarouselSlideData[]}
            activeIndex={currentIndex}
            position={pos}
            onSelect={goTo}
            showInfo={showThumbnailInfo}
        />
    );

    const renderHamburgerPanel = () => {
        if (!hamburgerOpen) return null;

        return (
            <div
                className={classNames('eui-carousel-hamburger-panel', `eui-carousel-hamburger-${thumbnailPosition}`)}
                role="dialog"
                aria-label="Slide list"
            >
                <div className="eui-carousel-hamburger-header">
                    <span className="eui-carousel-hamburger-title">Slides</span>
                    <button
                        className="eui-carousel-hamburger-close"
                        onClick={() => setHamburgerOpen(false)}
                        type="button"
                        aria-label="Close slide list"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="eui-carousel-hamburger-list" role="listbox" aria-label="Available slides">
                    {slides.map((slide, index) => {
                        const thumbSrc = slide.thumbnail || (slide.type === 'image' ? slide.src : undefined);
                        const isActive = index === currentIndex;
                        return (
                            <button
                                key={slide.id}
                                className={classNames('eui-carousel-hamburger-item', {
                                    'eui-carousel-hamburger-item-active': isActive,
                                })}
                                onClick={() => handleHamburgerSelect(index)}
                                role="option"
                                aria-selected={isActive}
                                type="button"
                            >
                                <div className="eui-carousel-hamburger-thumb">
                                    {thumbSrc ? (
                                        <img src={thumbSrc} alt={slide.alt || `Slide ${index + 1}`} draggable={false} />
                                    ) : (
                                        <div className="eui-carousel-hamburger-thumb-placeholder">{index + 1}</div>
                                    )}
                                </div>
                                <div className="eui-carousel-hamburger-info">
                                    <div className="eui-carousel-hamburger-name">
                                        {slide.name || slide.alt || `Slide ${index + 1}`}
                                    </div>
                                    {slide.description && (
                                        <div className="eui-carousel-hamburger-desc">{slide.description}</div>
                                    )}
                                </div>
                                {isActive && (
                                    <span className="eui-carousel-hamburger-active-badge" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const isInline = thumbnailMode === 'inline';

    return (
        <div
            ref={containerRef}
            className={classNames('eui-carousel', layoutClass, className)}
            role="region"
            aria-roledescription="carousel"
            aria-label="Image carousel"
            tabIndex={0}
            onMouseEnter={() => autoplay && setIsPaused(true)}
            onMouseLeave={() => autoplay && setIsPaused(false)}
        >
            {thumbnailsVisible && isInline && (thumbnailPosition === 'top' || thumbnailPosition === 'left') && renderThumbnails(thumbnailPosition)}

            <div className="eui-carousel-viewport">
                <div
                    ref={trackRef}
                    className="eui-carousel-track"
                    style={trackStyle}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                >
                    {slides.map((slide, index) => (
                        <CarouselSlideRenderer
                            key={slide.id}
                            slide={slide as CarouselSlideData}
                            isActive={index === currentIndex}
                            lazyLoad={lazyLoad}
                            aspectRatio={aspectRatio}
                            className={slideClassName}
                        />
                    ))}
                </div>

                {arrowsVisible && slideCount > 1 && (
                    <>
                        <button
                            className={classNames('eui-carousel-arrow eui-carousel-arrow-prev', {
                                'eui-carousel-arrow-disabled': !canGoPrev,
                            })}
                            onClick={goPrev}
                            disabled={!canGoPrev}
                            aria-label="Previous slide"
                            type="button"
                        >
                            {arrowLeftSvg}
                        </button>
                        <button
                            className={classNames('eui-carousel-arrow eui-carousel-arrow-next', {
                                'eui-carousel-arrow-disabled': !canGoNext,
                            })}
                            onClick={goNext}
                            disabled={!canGoNext}
                            aria-label="Next slide"
                            type="button"
                        >
                            {arrowRightSvg}
                        </button>
                    </>
                )}

                {thumbnailsVisible && !isInline && (
                    <button
                        className="eui-carousel-hamburger-btn"
                        onClick={() => setHamburgerOpen((p) => !p)}
                        aria-label="Toggle slide list"
                        aria-expanded={hamburgerOpen}
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {thumbnailsVisible && isInline && (thumbnailPosition === 'bottom' || thumbnailPosition === 'right') && renderThumbnails(thumbnailPosition)}

            {thumbnailsVisible && !isInline && renderHamburgerPanel()}

            {dotsVisible && slideCount > 1 && (
                <div className="eui-carousel-dots" role="tablist" aria-label="Slide indicators">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            className={classNames('eui-carousel-dot', {
                                'eui-carousel-dot-active': index === currentIndex,
                            })}
                            onClick={() => goTo(index)}
                            role="tab"
                            aria-selected={index === currentIndex}
                            aria-label={`Go to slide ${index + 1}`}
                            type="button"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export { Carousel };
export type { CarouselProps, CarouselSlide, ThumbnailMode };
