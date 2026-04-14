import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { useStoryTheme } from '../../StoryThemeContext';

const SetupSection: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">Sortable</code>{' '}
                is available from the main <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">fluxo-ui</code>{' '}
                entry — no provider wrapping and no extra peer dependencies.
            </p>
            <CodeBlock
                title="Use it directly"
                code={`import { Sortable } from 'fluxo-ui';

function MyList() {
  const [items, setItems] = useState(['One', 'Two', 'Three']);
  return (
    <Sortable items={items} onChange={setItems}>
      {(item) => <div className="row">{item}</div>}
    </Sortable>
  );
}`}
            />
            <p className={cn('mt-4 text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                Sortable ships with scroll-aware positioning, auto-scroll near container edges, touch and pen support, optional
                drag handles, delay activation, and fine-grained{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">canDragItem</code> /{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm">canDropItem</code> callbacks — all in the main library bundle.
            </p>
        </>
    );
};

export default SetupSection;
