import React from 'react';
import CanvasDraw from '../../../components/canvas-draw/CanvasDraw';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `// Toolbar on the bottom
<CanvasDraw
  background={{ type: 'color', color: '#eef2ff' }}
  toolbarPlacement="bottom"
/>

// Vertical toolbar on the left
<CanvasDraw
  background={{ type: 'color', color: '#fef3c7' }}
  toolbarPlacement="left"
/>

// Available: 'top' | 'bottom' | 'left' | 'right' | 'none'`;

const ToolbarPlacement: React.FC = () => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComponentDemo title="Bottom Toolbar" centered={false}>
                <CanvasDraw
                    background={{ type: 'color', color: '#eef2ff' }}
                    toolbarPlacement="bottom"
                    style={{ height: 380 }}
                />
            </ComponentDemo>
            <ComponentDemo title="Left Toolbar" centered={false}>
                <CanvasDraw
                    background={{ type: 'color', color: '#fef3c7' }}
                    toolbarPlacement="left"
                    style={{ height: 380 }}
                />
            </ComponentDemo>
        </div>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default ToolbarPlacement;
