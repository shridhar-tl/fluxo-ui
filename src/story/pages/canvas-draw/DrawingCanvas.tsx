import React, { useState } from 'react';
import CanvasDraw from '../../../components/canvas-draw/CanvasDraw';
import type { DrawItem } from '../../../components/canvas-draw/canvas-draw-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CanvasDraw
  background={{ type: 'color', color: '#f8f9fa' }}
  items={items}
  onItemsChange={setItems}
  defaultTool="freehand"
  style={{ height: 350 }}
/>`;

const DrawingCanvas: React.FC = () => {
    const [drawingItems, setDrawingItems] = useState<DrawItem[]>([]);

    return (
        <>
            <ComponentDemo title="Blank Canvas Drawing" centered={false}>
                <CanvasDraw
                    background={{ type: 'color', color: '#f8f9fa' }}
                    items={drawingItems}
                    onItemsChange={setDrawingItems}
                    defaultTool="freehand"
                    style={{ height: 350 }}
                />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default DrawingCanvas;
