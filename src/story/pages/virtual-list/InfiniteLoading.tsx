import React, { useCallback, useEffect, useState } from 'react';
import { VirtualList } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<VirtualList
    items={items}
    itemHeight={48}
    height={360}
    endReachedThreshold={150}
    onEndReached={() => loadMore()}
    renderItem={(item) => <Row item={item} />}
/>`;

interface Row { id: number; label: string; }

const InfiniteLoading: React.FC = () => {
    const [items, setItems] = useState<Row[]>(() =>
        Array.from({ length: 30 }, (_, i) => ({ id: i, label: `Notification ${i + 1}` })),
    );
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(() => {
        if (loading) return;
        setLoading(true);
        window.setTimeout(() => {
            setItems((prev) => {
                const start = prev.length;
                const next: Row[] = Array.from({ length: 30 }, (_, i) => ({ id: start + i, label: `Notification ${start + i + 1}` }));
                return [...prev, ...next];
            });
            setLoading(false);
        }, 600);
    }, [loading]);

    useEffect(() => {
        // ensure cleanup on unmount
        return () => undefined;
    }, []);

    return (
        <>
            <ComponentDemo title="Infinite scroll via onEndReached" description="Fires when scrolled within endReachedThreshold of the bottom. Pair with VirtualList for unbounded feeds.">
                <div style={{ width: '100%', maxWidth: 480 }}>
                    <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                        <VirtualList
                            items={items}
                            itemHeight={52}
                            height={320}
                            endReachedThreshold={120}
                            onEndReached={loadMore}
                            keyExtractor={(item) => item.id}
                            renderItem={(item) => (
                                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--eui-border-subtle)', color: 'var(--eui-text)' }}>{item.label}</div>
                            )}
                        />
                    </div>
                    <div style={{
                        marginTop: 12,
                        padding: '10px 14px',
                        background: 'var(--eui-bg-subtle)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 6,
                        fontSize: 12,
                        color: 'var(--eui-text-muted)',
                    }}>
                        Loaded <strong style={{ color: 'var(--eui-text)' }}>{items.length}</strong> items{loading ? ' · loading more…' : ''}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default InfiniteLoading;
