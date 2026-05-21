import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import AddImages from './AddImages';
import Autoplay from './Autoplay';
import BasicUsage from './BasicUsage';
import EditableThumbnails from './EditableThumbnails';
import ThumbnailNav from './ThumbnailNav';

import _Carousel_props_json from './../../../components/carousel/Carousel.props.json';
const { carouselProps, slideProps, thumbnailActionProps, trailingThumbnailProps } = _Carousel_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Image carousel with dots' },
    { id: 'thumbnails', title: 'Thumbnail Navigation', description: 'Thumbnail strip navigation' },
    { id: 'editable-thumbnails', title: 'Editable Thumbnails', description: 'Per-thumbnail actions + add tile' },
    { id: 'add-images', title: 'Add Images', description: 'Drop, paste, and pick image files' },
    { id: 'autoplay', title: 'Autoplay', description: 'Auto-advancing slides with loop' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'slide-props', title: 'CarouselSlide', description: 'Slide data interface' },
    { id: 'thumbnail-action-props', title: 'CarouselThumbnailAction', description: 'Per-thumbnail action interface' },
    { id: 'trailing-thumbnail-props', title: 'CarouselTrailingThumbnail', description: 'Trailing tile interface' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];



const features: FeatureItem[] = [
    {
        title: 'Swipe Gestures',
        description: 'Touch and pointer swipe support for mobile and desktop navigation.',
        icon: 'M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5',
    },
    {
        title: 'Autoplay',
        description: 'Auto-advance slides at a configurable interval, pausing on hover.',
        icon: 'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z',
    },
    {
        title: 'Thumbnails',
        description: 'Thumbnail strip with configurable position for visual slide selection.',
        icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 17.25h.008v.008H6.75v-.008z',
    },
    {
        title: 'Keyboard Navigation',
        description: 'Arrow keys navigate between slides with focus management.',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12',
    },
    {
        title: 'Lazy Loading',
        description: 'Only load slide content when it becomes active to reduce initial bandwidth.',
        icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
    },
    {
        title: 'Accessibility',
        description: 'ARIA roledescription, tab roles for dots, and labeled arrow buttons.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
];

const CarouselPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Carousel
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    An image and content carousel with swipe gestures, autoplay, thumbnail navigation, and keyboard support.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="thumbnails" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Thumbnail Navigation
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>navigation="thumbnails"</code> to display a clickable thumbnail strip below (or beside) the carousel.
                </p>
                <ThumbnailNav />
            </section>

            <section id="editable-thumbnails" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Editable Thumbnails
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Pass <code>thumbnailActions</code> for per-thumbnail overlay buttons and <code>trailingThumbnail</code> for an
                    extra tile after the strip. Both are fully generic — supply any icon and handler for delete, edit, add, or any
                    custom action.
                </p>
                <EditableThumbnails />
            </section>

            <section id="add-images" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Add Images
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Pass <code>onAddImages</code> to make the carousel an attachment surface. Files can be dragged onto the
                    viewport (a drop overlay appears) or chosen via the trailing add tile&apos;s file picker. Forward clipboard
                    paste from your form to the same callback for paste-anywhere support. Filter accepted files with
                    <code>addImagesAccept</code>.
                </p>
                <AddImages />
            </section>

            <section id="autoplay" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Autoplay</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Enable <code>autoplay</code> with <code>loop</code> for continuous slide rotation. Autoplay pauses on hover.
                </p>
                <Autoplay />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Carousel } from 'fluxo-ui';\nimport type { CarouselProps, CarouselSlide, CarouselThumbnailAction, CarouselTrailingThumbnail } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Carousel Props</h2>
                <PropsTable props={carouselProps} />
            </section>

            <section id="slide-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    CarouselSlide Interface
                </h2>
                <PropsTable props={slideProps} />
            </section>

            <section id="thumbnail-action-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    CarouselThumbnailAction Interface
                </h2>
                <PropsTable props={thumbnailActionProps} />
            </section>

            <section id="trailing-thumbnail-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    CarouselTrailingThumbnail Interface
                </h2>
                <PropsTable props={trailingThumbnailProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default CarouselPage;
