import React, { useCallback, useState } from 'react';
import { InfiniteScroll } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const generateItems = (start: number, count: number) =>
    Array.from({ length: count }, (_, i) => ({
        id: start + i,
        title: `Record ${start + i + 1}`,
    }));

const code = `import { InfiniteScroll } from 'ether-ui';

const [error, setError] = useState<string | null>(null);

const loadMore = async () => {
  await new Promise((r) => setTimeout(r, 800));
  // Simulate random failures
  if (Math.random() > 0.5) {
    throw new Error('Network error');
  }
  setItems((prev) => [...prev, ...newItems]);
};

<InfiniteScroll
  loadMore={loadMore}
  hasMore={hasMore}
  error={error}
  onRetry={() => { setError(null); loadMore(); }}
/>`;

const ErrorHandling: React.FC = () => {
    const [items, setItems] = useState(() => generateItems(0, 10));
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const loadCountRef = React.useRef(0);

    const loadMore = useCallback(async () => {
        await new Promise((r) => setTimeout(r, 800));
        loadCountRef.current++;
        {
            const next = loadCountRef.current;
            if (next % 2 === 0) {
                setError('Failed to load data. Please try again.');
                return;
            }
            setItems((prevItems) => {
                const newItems = generateItems(prevItems.length, 10);
                const all = [...prevItems, ...newItems];
                if (all.length >= 50) {
                    setHasMore(false);
                }
                return all;
            });
        }
    }, []);

    const handleRetry = useCallback(() => {
        setError(null);
    }, []);

    return (
        <>
            <ComponentDemo title="Error Handling with Retry" description="When loading fails, an error message with a retry button is displayed. Every other load attempt simulates a failure." centered={false}>
                <div className="h-72 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg" id="error-scroll-container">
                    <InfiniteScroll
                        loadMore={loadMore}
                        hasMore={hasMore}
                        error={error}
                        onRetry={handleRetry}
                        scrollableTarget="error-scroll-container"
                    >
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map((item) => (
                                <div key={item.id} className="px-4 py-3">
                                    <div className="font-medium">{item.title}</div>
                                </div>
                            ))}
                        </div>
                    </InfiniteScroll>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ErrorHandling;
