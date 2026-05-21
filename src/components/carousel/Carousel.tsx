import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ImageIcon, MenuIcon, PauseIcon, PlayIcon, TimesIcon } from '../../assets/icons';
import CarouselSlideRenderer from './CarouselSlide';
import type { CarouselSlideData } from './CarouselSlide';
import CarouselThumbnails from './CarouselThumbnails';
import type { CarouselThumbnailAction, CarouselTrailingThumbnail } from './CarouselThumbnails';
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
    ariaLabel?: string;
    showAutoplayToggle?: boolean;
    thumbnailActions?: CarouselThumbnailAction[];
    trailingThumbnail?: CarouselTrailingThumbnail;
    onAddImages?: (files: File[]) => void;
    addImagesAccept?: string;
    addImagesDropLabel?: string;
}

const collectImageFiles = (list: FileList | File[] | null | undefined, accept: string): File[] => {
    if (!list) return [];
    const files = Array.from(list);
    if (accept === '*' || accept === '*/*' || accept.trim() === '') return files;
    const patterns = accept.split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean);
    if (patterns.length === 0) return files;
    return files.filter((file) => {
        const type = file.type.toLowerCase();
        const name = file.name.toLowerCase();
        return patterns.some((pattern) => {
            if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1));
            if (pattern.startsWith('.')) return name.endsWith(pattern);
            return type === pattern;
        });
    });
};

const dragEventHasFiles = (event: React.DragEvent): boolean =>
    Array.from(event.dataTransfer?.types ?? []).includes('Files');

const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

const reducedMotionMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

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
    ariaLabel = 'Image carousel',
    showAutoplayToggle = true,
    thumbnailActions,
    trailingThumbnail,
    onAddImages,
    addImagesAccept = 'image/*',
    addImagesDropLabel = 'Drop image to add',
}: CarouselProps) {
    const [internalIndex, setInternalIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [hoverPause, setHoverPause] = useState(false);
    const [focusPause, setFocusPause] = useState(false);
    const [autoplayActive, setAutoplayActive] = useState(autoplay);
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [slideAnnouncement, setSlideAnnouncement] = useState('');
    const [isDraggingFiles, setIsDraggingFiles] = useState(false);
    const dragDepthRef = useRef(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const hamburgerPanelRef = useRef<HTMLDivElement>(null);
    const hamburgerTriggerRef = useRef<HTMLButtonElement>(null);
    const generatedId = useId();
    const baseId = `eui-carousel-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const isControlled = controlledIndex !== undefined;
    const currentIndex = isControlled ? controlledIndex : internalIndex;
    const slideCount = slides.length;
    const reducedMotion = reducedMotionMatches();

    const dotsVisible = showDots !== undefined ? showDots : navigation === 'dots';
    const arrowsVisible = showArrows !== undefined ? showArrows : navigation === 'arrows' || navigation === 'thumbnails';
    const thumbnailsVisible = navigation === 'thumbnails';

    useEffect(() => {
        setAutoplayActive(autoplay);
    }, [autoplay]);

    const isPaused = hoverPause || focusPause || !autoplayActive;

    const goTo = useCallback((index: number) => {
        let nextIndex = index;
        if (loop) {
            nextIndex = ((index % slideCount) + slideCount) % slideCount;
        } else {
            nextIndex = Math.max(0, Math.min(index, slideCount - 1));
        }

        if (nextIndex === currentIndex) return;

        if (!reducedMotion) setIsTransitioning(true);
        if (!isControlled) {
            setInternalIndex(nextIndex);
        }
        onSlideChange?.(nextIndex);
    }, [currentIndex, isControlled, loop, onSlideChange, slideCount, reducedMotion]);

    const goNext = useCallback(() => {
        if (!loop && currentIndex >= slideCount - 1) return;
        goTo(currentIndex + 1);
    }, [currentIndex, goTo, loop, slideCount]);

    const goPrev = useCallback(() => {
        if (!loop && currentIndex <= 0) return;
        goTo(currentIndex - 1);
    }, [currentIndex, goTo, loop]);

    useEffect(() => {
        if (!isTransitioning) return;
        const timer = window.setTimeout(() => setIsTransitioning(false), reducedMotion ? 0 : 400);
        return () => window.clearTimeout(timer);
    }, [isTransitioning, reducedMotion]);

    useEffect(() => {
        if (slideCount === 0) return;
        const slide = slides[currentIndex];
        const name = slide?.name ?? slide?.alt ?? `Slide ${currentIndex + 1}`;
        const message = `Slide ${currentIndex + 1} of ${slideCount}: ${name}`;
        setSlideAnnouncement('');
        const t = window.setTimeout(() => setSlideAnnouncement(message), 30);
        return () => window.clearTimeout(t);
    }, [currentIndex, slideCount, slides]);

    useEffect(() => {
        if (autoplayActive && !isPaused && slideCount > 1) {
            autoplayTimerRef.current = setInterval(goNext, autoplayInterval);
            return () => clearInterval(autoplayTimerRef.current);
        }
        return () => clearInterval(autoplayTimerRef.current);
    }, [autoplayActive, autoplayInterval, goNext, isPaused, slideCount]);

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

    useEffect(() => {
        if (!hamburgerOpen) return;

        const previousFocus = document.activeElement as HTMLElement | null;
        const focusFrame = requestAnimationFrame(() => {
            const panel = hamburgerPanelRef.current;
            if (!panel) return;
            const focusable = panel.querySelectorAll<HTMLElement>(focusableSelector);
            if (focusable.length > 0) focusable[0].focus();
            else panel.focus();
        });

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setHamburgerOpen(false);
                hamburgerTriggerRef.current?.focus();
                return;
            }
            if (e.key !== 'Tab') return;
            const panel = hamburgerPanelRef.current;
            if (!panel) return;
            const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(
                (el) => el.tabIndex !== -1,
            );
            if (focusable.length === 0) {
                e.preventDefault();
                panel.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            cancelAnimationFrame(focusFrame);
            document.removeEventListener('keydown', handleKeyDown);
            previousFocus?.focus?.();
        };
    }, [hamburgerOpen]);

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

    const emitAddImages = useCallback((list: FileList | File[] | null | undefined) => {
        if (!onAddImages) return;
        const files = collectImageFiles(list, addImagesAccept);
        if (files.length > 0) onAddImages(files);
    }, [onAddImages, addImagesAccept]);

    const openFilePicker = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        emitAddImages(e.target.files);
        e.target.value = '';
    }, [emitAddImages]);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        if (!onAddImages || !dragEventHasFiles(e)) return;
        e.preventDefault();
        dragDepthRef.current += 1;
        setIsDraggingFiles(true);
    }, [onAddImages]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (!onAddImages || !dragEventHasFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, [onAddImages]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        if (!onAddImages || !dragEventHasFiles(e)) return;
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) setIsDraggingFiles(false);
    }, [onAddImages]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        if (!onAddImages || !dragEventHasFiles(e)) return;
        e.preventDefault();
        dragDepthRef.current = 0;
        setIsDraggingFiles(false);
        emitAddImages(e.dataTransfer?.files);
    }, [onAddImages, emitAddImages]);

    const trackStyle: React.CSSProperties = useMemo(() => ({
        transform: `translateX(-${currentIndex * 100}%)`,
        transition: isTransitioning && !reducedMotion ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
    }), [currentIndex, isTransitioning, reducedMotion]);

    const canGoPrev = loop || currentIndex > 0;
    const canGoNext = loop || currentIndex < slideCount - 1;

    const layoutClass = thumbnailsVisible && thumbnailMode === 'inline'
        ? `eui-carousel-layout-${thumbnailPosition}`
        : undefined;

    const handleHamburgerSelect = useCallback((index: number) => {
        goTo(index);
        setHamburgerOpen(false);
        hamburgerTriggerRef.current?.focus();
    }, [goTo]);

    const effectiveTrailing: CarouselTrailingThumbnail | undefined = trailingThumbnail
        ?? (onAddImages
            ? { icon: <ImageIcon />, label: addImagesDropLabel, onClick: openFilePicker }
            : undefined);

    const renderThumbnails = (pos: 'top' | 'bottom' | 'left' | 'right') => (
        <CarouselThumbnails
            slides={slides as CarouselSlideData[]}
            activeIndex={currentIndex}
            position={pos}
            onSelect={goTo}
            showInfo={showThumbnailInfo}
            actions={thumbnailActions}
            trailingThumbnail={effectiveTrailing}
        />
    );

    const renderHamburgerPanel = () => {
        if (!hamburgerOpen) return null;

        return (
            <div
                ref={hamburgerPanelRef}
                className={classNames('eui-carousel-hamburger-panel', `eui-carousel-hamburger-${thumbnailPosition}`)}
                role="dialog"
                aria-modal="true"
                aria-label="Slide list"
                tabIndex={-1}
            >
                <div className="eui-carousel-hamburger-header">
                    <span className="eui-carousel-hamburger-title">Slides</span>
                    <button
                        className="eui-carousel-hamburger-close"
                        onClick={() => setHamburgerOpen(false)}
                        type="button"
                        aria-label="Close slide list"
                    >
                        <TimesIcon aria-hidden="true" />
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
                                        <CheckIcon />
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
        <section
            ref={containerRef}
            className={classNames('eui-carousel', layoutClass, className, {
                'eui-carousel-dropping': isDraggingFiles,
            })}
            aria-roledescription="carousel"
            aria-label={ariaLabel}
            tabIndex={0}
            onMouseEnter={() => setHoverPause(true)}
            onMouseLeave={() => setHoverPause(false)}
            onFocusCapture={() => setFocusPause(true)}
            onBlurCapture={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setFocusPause(false);
            }}
            onDragEnter={onAddImages ? handleDragEnter : undefined}
            onDragOver={onAddImages ? handleDragOver : undefined}
            onDragLeave={onAddImages ? handleDragLeave : undefined}
            onDrop={onAddImages ? handleDrop : undefined}
        >
            {onAddImages && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={addImagesAccept}
                    multiple
                    className="eui-visually-hidden"
                    onChange={handleFileInputChange}
                    tabIndex={-1}
                    aria-hidden="true"
                />
            )}
            {onAddImages && isDraggingFiles && (
                <div className="eui-carousel-drop-overlay" aria-hidden="true">
                    <ImageIcon />
                    <span>{addImagesDropLabel}</span>
                </div>
            )}
            {thumbnailsVisible && isInline && (thumbnailPosition === 'top' || thumbnailPosition === 'left') && renderThumbnails(thumbnailPosition)}

            <div className="eui-carousel-viewport">
                <div
                    ref={trackRef}
                    className="eui-carousel-track"
                    style={trackStyle}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    aria-live={autoplayActive ? 'off' : 'polite'}
                >
                    {slides.map((slide, index) => {
                        const slideId = `${baseId}-slide-${index}`;
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={slide.id}
                                id={slideId}
                                role="group"
                                aria-roledescription="slide"
                                aria-label={`${index + 1} of ${slideCount}${slide.name ? `: ${slide.name}` : ''}`}
                                aria-hidden={!isActive}
                                inert={!isActive}
                                className="eui-carousel-slide-wrapper"
                            >
                                <CarouselSlideRenderer
                                    slide={slide as CarouselSlideData}
                                    isActive={isActive}
                                    lazyLoad={lazyLoad}
                                    aspectRatio={aspectRatio}
                                    className={slideClassName}
                                />
                            </div>
                        );
                    })}
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
                            <ChevronLeftIcon aria-hidden="true" />
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
                            <ChevronRightIcon aria-hidden="true" />
                        </button>
                    </>
                )}

                {autoplay && showAutoplayToggle && slideCount > 1 && (
                    <button
                        className="eui-carousel-autoplay-toggle"
                        onClick={() => setAutoplayActive((p) => !p)}
                        aria-label={autoplayActive ? 'Pause autoplay' : 'Start autoplay'}
                        aria-pressed={!autoplayActive}
                        type="button"
                    >
                        {autoplayActive ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
                    </button>
                )}

                {thumbnailsVisible && !isInline && (
                    <button
                        ref={hamburgerTriggerRef}
                        className="eui-carousel-hamburger-btn"
                        onClick={() => setHamburgerOpen((p) => !p)}
                        aria-label="Toggle slide list"
                        aria-expanded={hamburgerOpen}
                        aria-haspopup="dialog"
                        type="button"
                    >
                        <MenuIcon aria-hidden="true" />
                    </button>
                )}
            </div>

            {thumbnailsVisible && isInline && (thumbnailPosition === 'bottom' || thumbnailPosition === 'right') && renderThumbnails(thumbnailPosition)}

            {thumbnailsVisible && !isInline && renderHamburgerPanel()}

            {dotsVisible && slideCount > 1 && (
                <div className="eui-carousel-dots" role="tablist" aria-label="Slide indicators">
                    {slides.map((slide, index) => {
                        const slideId = `${baseId}-slide-${index}`;
                        const isActive = index === currentIndex;
                        return (
                            <button
                                key={slide.id}
                                className={classNames('eui-carousel-dot', {
                                    'eui-carousel-dot-active': isActive,
                                })}
                                onClick={() => goTo(index)}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={slideId}
                                aria-label={`Go to slide ${index + 1}`}
                                tabIndex={isActive ? 0 : -1}
                                type="button"
                            />
                        );
                    })}
                </div>
            )}

            <div className="eui-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
                {slideAnnouncement}
            </div>
        </section>
    );
}

export { Carousel };
export type { CarouselProps, CarouselSlide, ThumbnailMode };
export type { CarouselThumbnailAction, CarouselTrailingThumbnail } from './CarouselThumbnails';
