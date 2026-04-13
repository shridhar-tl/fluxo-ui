import React from 'react';
import CanvasDraw from '../../../components/canvas-draw/CanvasDraw';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CanvasDraw
  background={{ type: 'color', color: '#faf5ff' }}
  features={{
    tools: {
      select: true,
      arrow: true,
      rect: true,
      freehand: false,
      line: false,
      circle: false,
      text: false,
      balloon: false,
      step: false,
    },
    timing: false,
    transitions: false,
    groups: false,
  }}
/>`;

const ToolSubset: React.FC = () => (
    <>
        <ComponentDemo title="Arrows & Rectangles Only" centered={false}>
            <CanvasDraw
                background={{ type: 'color', color: '#faf5ff' }}
                features={{
                    tools: {
                        select: true,
                        arrow: true,
                        rect: true,
                        freehand: false,
                        line: false,
                        circle: false,
                        text: false,
                        balloon: false,
                        step: false,
                    },
                    timing: false,
                    transitions: false,
                    groups: false,
                }}
                style={{ height: 380 }}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default ToolSubset;
