import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

interface CarouselSlideData {
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

interface CarouselSlideProps {
    slide: CarouselSlideData;
    isActive: boolean;
    lazyLoad: boolean;
    aspectRatio?: string;
    className?: string;
}

function CarouselSlide({ slide, isActive, lazyLoad, aspectRatio, className }: CarouselSlideProps) {
    const [loaded, setLoaded] = useState(!lazyLoad);
    const [imageLoaded, setImageLoaded] = useState(false);
    const slideRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (lazyLoad && isActive && !loaded) {
            setLoaded(true);
        }
    }, [isActive, lazyLoad, loaded]);

    const slideStyle: React.CSSProperties = aspectRatio ? { aspectRatio } : {};

    const renderContent = () => {
        if (!loaded && lazyLoad) {
            return <div className="eui-carousel-placeholder" />;
        }

        switch (slide.type) {
            case 'image':
                return (
                    <img
                        src={slide.src}
                        alt={slide.alt || ''}
                        className={classNames('eui-carousel-image', { 'eui-carousel-image-loaded': imageLoaded })}
                        onLoad={() => setImageLoaded(true)}
                        loading={lazyLoad ? 'lazy' : undefined}
                        draggable={false}
                    />
                );
            case 'video':
                return (
                    <div className="eui-carousel-video-wrapper">
                        <iframe
                            src={`https://www.youtube.com/embed/${slide.videoId}?rel=0`}
                            title={slide.alt || 'Video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="eui-carousel-video-iframe"
                        />
                    </div>
                );
            case 'custom':
                return <div className="eui-carousel-custom">{slide.content}</div>;
            default:
                return null;
        }
    };

    return (
        <div
            ref={slideRef}
            className={classNames('eui-carousel-slide', className, {
                'eui-carousel-slide-active': isActive,
            })}
            style={slideStyle}
            role="tabpanel"
            aria-roledescription="slide"
            aria-label={slide.alt || `Slide ${slide.id}`}
            aria-hidden={!isActive}
        >
            {renderContent()}
        </div>
    );
}

export default CarouselSlide;
export type { CarouselSlideData };
