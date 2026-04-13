import React, { useState } from 'react';
import CanvasDraw from '../../../components/canvas-draw/CanvasDraw';
import type { DrawItem } from '../../../components/canvas-draw/canvas-draw-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { prebuiltItems, sampleImageUrl } from './canvas-draw-story-data';

const code = `import { CanvasDraw } from 'fluxo-ui';
import type { DrawItem } from 'fluxo-ui';

const [items, setItems] = useState<DrawItem[]>([]);

<CanvasDraw
  background={{ type: 'image', src: '/screenshot.png' }}
  items={items}
  onItemsChange={setItems}
  style={{ height: 400 }}
/>`;

const ImageAnnotation: React.FC = () => {
    const [imageItems, setImageItems] = useState<DrawItem[]>(prebuiltItems);

    return (
        <>
            <ComponentDemo title="Annotate an Image" centered={false}>
                <CanvasDraw
                    background={{ type: 'image', src: sampleImageUrl }}
                    items={imageItems}
                    onItemsChange={setImageItems}
                    style={{ height: 400 }}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Image Annotation" code={code} />
            </div>
        </>
    );
};

export default ImageAnnotation;
