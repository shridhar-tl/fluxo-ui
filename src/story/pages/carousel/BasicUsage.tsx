import React from 'react';
import type { CarouselSlide } from '../../../components';
import { Carousel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const slides: CarouselSlide[] = [
    { id: 's1', type: 'image', src: 'https://picsum.photos/seed/carousel1/800/400', alt: 'Mountain landscape' },
    { id: 's2', type: 'image', src: 'https://picsum.photos/seed/carousel2/800/400', alt: 'Ocean sunset' },
    { id: 's3', type: 'image', src: 'https://picsum.photos/seed/carousel3/800/400', alt: 'City skyline' },
    { id: 's4', type: 'image', src: 'https://picsum.photos/seed/carousel4/800/400', alt: 'Forest trail' },
    { id: 's5', type: 'image', src: 'https://picsum.photos/seed/carousel5/800/400', alt: 'Desert dunes' },
];

const code = `import { Carousel } from 'fluxo-ui';
import type { CarouselSlide } from 'fluxo-ui';

const slides: CarouselSlide[] = [
  { id: 's1', type: 'image', src: '/photo1.jpg', alt: 'Mountain landscape' },
  { id: 's2', type: 'image', src: '/photo2.jpg', alt: 'Ocean sunset' },
  { id: 's3', type: 'image', src: '/photo3.jpg', alt: 'City skyline' },
];

<Carousel slides={slides} />`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Image Carousel" description="A basic image carousel with dot navigation and arrow buttons." centered={false}>
            <div className="w-full max-w-2xl mx-auto">
                <Carousel slides={slides} aspectRatio="16/9" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
