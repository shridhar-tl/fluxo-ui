import React from 'react';
import type { CarouselSlide } from '../../../components';
import { Carousel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const slides: CarouselSlide[] = [
    {
        id: 't1',
        type: 'image',
        src: 'https://picsum.photos/seed/thumb1/800/500',
        alt: 'Slide 1',
        thumbnail: 'https://picsum.photos/seed/thumb1/120/80',
    },
    {
        id: 't2',
        type: 'image',
        src: 'https://picsum.photos/seed/thumb2/800/500',
        alt: 'Slide 2',
        thumbnail: 'https://picsum.photos/seed/thumb2/120/80',
    },
    {
        id: 't3',
        type: 'image',
        src: 'https://picsum.photos/seed/thumb3/800/500',
        alt: 'Slide 3',
        thumbnail: 'https://picsum.photos/seed/thumb3/120/80',
    },
    {
        id: 't4',
        type: 'image',
        src: 'https://picsum.photos/seed/thumb4/800/500',
        alt: 'Slide 4',
        thumbnail: 'https://picsum.photos/seed/thumb4/120/80',
    },
    {
        id: 't5',
        type: 'image',
        src: 'https://picsum.photos/seed/thumb5/800/500',
        alt: 'Slide 5',
        thumbnail: 'https://picsum.photos/seed/thumb5/120/80',
    },
    {
        id: 't6',
        type: 'image',
        src: 'https://picsum.photos/seed/thumb6/800/500',
        alt: 'Slide 6',
        thumbnail: 'https://picsum.photos/seed/thumb6/120/80',
    },
];

const code = `import { Carousel } from 'fluxo-ui';

<Carousel
  slides={slides}
  navigation="thumbnails"
  thumbnailPosition="bottom"
/>`;

const ThumbnailNav: React.FC = () => (
    <>
        <ComponentDemo
            title="Thumbnail Navigation"
            description="Navigate slides using clickable thumbnail strip below the main viewport."
            centered={false}
        >
            <div className="w-full max-w-2xl mx-auto">
                <Carousel slides={slides} navigation="thumbnails" thumbnailPosition="bottom" aspectRatio="16/10" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ThumbnailNav;
