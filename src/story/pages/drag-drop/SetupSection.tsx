import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { useStoryTheme } from '../../StoryThemeContext';

const SetupSection: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                Drag & drop components work out of the box — no provider wrapping, no extra peer dependencies.
                Just import from <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">fluxo-ui</code> and go.
            </p>
            <CodeBlock
                title="Use it directly"
                code={`import { Draggable, Droppable } from 'fluxo-ui';

function MyList() {
  return (
    <>
      <Draggable containerId="list" index={0} item={myItem}>
        <div>Drag me</div>
      </Draggable>
      <Droppable containerId="target" index={0} onDrop={handleDrop}>
        <div>Drop here</div>
      </Droppable>
    </>
  );
}`}
            />
            <p className={cn('mt-4 text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                The built-in engine supports mouse, touch, pen, drag handles, delay activation, custom live previews, auto-scroll
                near container edges, and scroll-aware positioning — all with zero third-party dependencies. An optional{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">DragDropProvider</code>{' '}
                is still exported for backwards compatibility but is no longer required.
            </p>
        </>
    );
};

export default SetupSection;
