import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { useStoryTheme } from '../../StoryThemeContext';

const SetupSection: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                Before using the Sortable component, you must wrap your app with the DragDropProvider at the root level.
            </p>
            <CodeBlock title="1. Install peer dependencies" code={`npm install react-dnd react-dnd-html5-backend`} />
            <CodeBlock
                title="2. Wrap your app with DragDropProvider"
                code={`import { DragDropProvider } from 'fluxo-ui/dnd';

function App() {
  return (
    <DragDropProvider>
      <YourApp />
    </DragDropProvider>
  );
}`}
            />
            <p className={cn('mt-4 text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                Drag & Drop components are available from the{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">fluxo-ui/dnd</code> entry point. This keeps{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">react-dnd</code> as an optional dependency —
                projects that don't use drag & drop won't need to install it.
            </p>
        </>
    );
};

export default SetupSection;
