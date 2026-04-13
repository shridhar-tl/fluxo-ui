import React from 'react';
import CanvasDraw from '../../../components/canvas-draw/CanvasDraw';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { timedItems } from './canvas-draw-story-data';

const code = `const items: DrawItem[] = [
  {
    id: 'item-1',
    object: { type: 'rect', /* ... */ },
    showAtMs: 0,
    hideAtMs: 3000,
    transition: 'fade',
    groupId: null,
    xPct: 0.1, yPct: 0.15, wPct: 0.3, hPct: 0.3,
  },
  {
    id: 'item-2',
    object: { type: 'arrow', /* ... */ },
    showAtMs: 2000,
    hideAtMs: 5000,
    transition: 'scale',
    groupId: null,
    xPct: 0.5, yPct: 0.2, wPct: 0.3, hPct: 0.3,
  },
];

<CanvasDraw
  background={{ type: 'color', color: '#1a1a2e' }}
  items={items}
  currentMs={currentMs}
  mediaDurationMs={8000}
  features={{ timing: true, transitions: true, groups: true }}
/>`;

const TimedAnnotations: React.FC = () => (
    <>
        <ComponentDemo title="Timed Items — Enable Timing in Features" centered={false}>
            <CanvasDraw
                background={{ type: 'color', color: '#1a1a2e' }}
                items={timedItems}
                currentMs={0}
                mediaDurationMs={8000}
                features={{
                    timing: true,
                    transitions: true,
                    groups: true,
                }}
                style={{ height: 380 }}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default TimedAnnotations;
