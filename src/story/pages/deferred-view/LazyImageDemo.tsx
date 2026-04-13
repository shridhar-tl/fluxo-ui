import React, { useEffect, useState } from 'react';
import { DeferredView, ShimmerDiv } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const imageUrls = [
    'https://picsum.photos/seed/defer1/400/250',
    'https://picsum.photos/seed/defer2/400/250',
    'https://picsum.photos/seed/defer3/400/250',
    'https://picsum.photos/seed/defer4/400/250',
    'https://picsum.photos/seed/defer5/400/250',
    'https://picsum.photos/seed/defer6/400/250',
];

const DeferredImage: React.FC<{ src: string; index: number }> = ({ src, index }) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.onload = () => setLoaded(true);
        img.src = src;
    }, [src]);

    return (
        <div className="rounded-lg overflow-hidden border border-gray-700">
            {!loaded ? (
                <ShimmerDiv style={{ height: 160, width: '100%' }} />
            ) : (
                <img src={src} alt={`Deferred image ${index + 1}`} className="w-full h-40 object-cover" />
            )}
            <div className="p-2 text-xs opacity-60 text-center">Image {index + 1}</div>
        </div>
    );
};

const imagePlaceholder = <ShimmerDiv style={{ height: 185, width: '100%', borderRadius: 8 }} />;

const LazyImageDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Lazy image gallery"
                description="Images are not fetched until their container enters the viewport. This is ideal for long pages with many images."
            >
                <div className="h-72 overflow-y-auto rounded-lg border border-gray-700 p-4 w-full">
                    <div className="grid grid-cols-2 gap-4">
                        {imageUrls.map((url, i) => (
                            <DeferredView key={url} placeholder={imagePlaceholder} rootMargin="50px">
                                <DeferredImage src={url} index={i} />
                            </DeferredView>
                        ))}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import { DeferredView, ShimmerDiv } from 'fluxo-ui';

const placeholder = <ShimmerDiv style={{ height: 185, width: '100%' }} />;

{images.map((url) => (
  <DeferredView key={url} placeholder={placeholder} rootMargin="50px">
    <img src={url} alt="Lazy loaded" />
  </DeferredView>
))}`}
                />
            </div>
        </>
    );
};

export default LazyImageDemo;
