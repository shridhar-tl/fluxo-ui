import React from 'react';
import CanvasDraw from '../../../components/canvas-draw/CanvasDraw';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleImageUrl, prebuiltItems } from './canvas-draw-story-data';

const code = `<CanvasDraw
  background={{ type: 'image', src: '/screenshot.png' }}
  items={savedItems}
  isEditing={false}
/>`;

const ReadOnlyMode: React.FC = () => (
    <>
        <ComponentDemo title="View-Only with Pre-drawn Items" centered={false}>
            <CanvasDraw
                background={{ type: 'image', src: sampleImageUrl }}
                items={prebuiltItems}
                isEditing={false}
                style={{ height: 380 }}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default ReadOnlyMode;
