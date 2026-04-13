import React from 'react';
import CanvasDraw from '../../../components/canvas-draw/CanvasDraw';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CanvasDraw
  background={{ type: 'color', color: '#f0fdf4' }}
  features={{
    timing: false,
    transitions: false,
    groups: false,
    export: false,
    fontControls: false,
    roundedCorners: false,
  }}
/>`;

const FeatureFlags: React.FC = () => (
    <>
        <ComponentDemo title="Minimal Toolbar — Drawing Only" centered={false}>
            <CanvasDraw
                background={{ type: 'color', color: '#f0fdf4' }}
                features={{
                    timing: false,
                    transitions: false,
                    groups: false,
                    export: false,
                    fontControls: false,
                    roundedCorners: false,
                }}
                style={{ height: 380 }}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default FeatureFlags;
