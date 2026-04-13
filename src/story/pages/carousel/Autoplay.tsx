import React from 'react';
import { Carousel } from '../../../components';
import type { CarouselSlide } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const slides: CarouselSlide[] = [
    { id: 'a1', type: 'image', src: 'https://picsum.photos/seed/auto1/800/400', alt: 'Slide 1' },
    { id: 'a2', type: 'image', src: 'https://picsum.photos/seed/auto2/800/400', alt: 'Slide 2' },
    { id: 'a3', type: 'image', src: 'https://picsum.photos/seed/auto3/800/400', alt: 'Slide 3' },
    { id: 'a4', type: 'image', src: 'https://picsum.photos/seed/auto4/800/400', alt: 'Slide 4' },
];

const code = `import { Carousel } from 'ether-ui';

<Carousel
  slides={slides}
  autoplay
  autoplayInterval={3000}
  loop
/>`;

const Autoplay: React.FC = () => (
    <>
        <ComponentDemo title="Autoplay with Loop" description="Slides advance automatically every 3 seconds and loop back to the first slide. Pauses on hover." centered={false}>
            <div className="w-full max-w-2xl mx-auto">
                <Carousel
                    slides={slides}
                    autoplay
                    autoplayInterval={3000}
                    loop
                    aspectRatio="16/9"
                />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Autoplay;
