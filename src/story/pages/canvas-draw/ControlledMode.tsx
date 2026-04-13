import cn from 'classnames';
import React, { useState } from 'react';
import CanvasDraw from '../../../components/canvas-draw/CanvasDraw';
import type { DrawItem } from '../../../components/canvas-draw/canvas-draw-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `const [items, setItems] = useState<DrawItem[]>([]);

<CanvasDraw
  background={{ type: 'color', color: '#fff7ed' }}
  items={items}
  onItemsChange={setItems}
/>

// Uncontrolled — just omit items prop:
<CanvasDraw background={{ type: 'color', color: '#fff' }} />`;

const ControlledMode: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [controlledItems, setControlledItems] = useState<DrawItem[]>([]);

    return (
        <>
            <ComponentDemo title="Controlled — Item Count Tracked Externally" centered={false}>
                <div className="space-y-3">
                    <CanvasDraw
                        background={{ type: 'color', color: '#fff7ed' }}
                        items={controlledItems}
                        onItemsChange={setControlledItems}
                        style={{ height: 380 }}
                    />
                    <div className={cn('text-sm px-4 py-2 rounded border', {
                        'border-blue-800 bg-blue-900/30 text-blue-300': isDark,
                        'border-blue-200 bg-blue-50 text-blue-800': !isDark,
                    })}>
                        Items drawn: <strong>{controlledItems.length}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ControlledMode;
