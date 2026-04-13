import React, { useCallback, useState } from 'react';
import { InfiniteScroll } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const pageSize = 20;
const totalItems = 100;

const generateItems = (start: number, count: number) =>
    Array.from({ length: count }, (_, i) => ({
        id: start + i,
        title: `Item ${start + i + 1}`,
        description: `Description for item ${start + i + 1}`,
    }));

const code = `import { InfiniteScroll } from 'ether-ui';

const [items, setItems] = useState(generateItems(0, 20));
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  const newItems = generateItems(items.length, 20);
  setItems((prev) => [...prev, ...newItems]);
  if (items.length + 20 >= 100) setHasMore(false);
};

<InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
  {items.map((item) => (
    <div key={item.id}>{item.title}</div>
  ))}
</InfiniteScroll>`;

const BasicUsage: React.FC = () => {
    const [items, setItems] = useState(() => generateItems(0, pageSize));
    const [hasMore, setHasMore] = useState(true);

    const loadMore = useCallback(async () => {
        await new Promise((r) => setTimeout(r, 1000));
        setItems((prev) => {
            const newItems = generateItems(prev.length, pageSize);
            const all = [...prev, ...newItems];
            if (all.length >= totalItems) {
                setHasMore(false);
            }
            return all;
        });
    }, []);

    return (
        <>
            <ComponentDemo title="Scrollable List" description="Scroll down to automatically load more items. Shows a spinner during loading and end message when all items are loaded." centered={false}>
                <div className="h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg" id="scroll-container">
                    <InfiniteScroll loadMore={loadMore} hasMore={hasMore} scrollableTarget="scroll-container">
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map((item) => (
                                <div key={item.id} className="px-4 py-3">
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-sm opacity-60">{item.description}</div>
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

export default BasicUsage;
