import React, { useCallback, useState } from 'react';
import { PullToRefresh } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { PullToRefresh } from 'fluxo-ui';

<PullToRefresh onRefresh={async () => {
    await fetchLatest();
}}>
    {/* scrollable content */}
</PullToRefresh>`;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const BasicUsage: React.FC = () => {
    const [items, setItems] = useState<string[]>(() => Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
    const [refreshes, setRefreshes] = useState(0);

    const handleRefresh = useCallback(async () => {
        await wait(900);
        setRefreshes((n) => n + 1);
        setItems((prev) => [`Refresh #${refreshes + 1}`, ...prev].slice(0, 20));
    }, [refreshes]);

    return (
        <>
            <ComponentDemo title="Pull down to refresh" description="Touch the panel below, drag down past the threshold, and release. Promise-aware indicator stays visible until refresh resolves.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                        height: 320,
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: 'var(--eui-bg-subtle)',
                    }}>
                        <PullToRefresh onRefresh={handleRefresh}>
                            <ul style={{ listStyle: 'none', margin: 0, padding: '8px 16px' }}>
                                {items.map((item) => (
                                    <li key={item} style={{
                                        padding: '12px 0',
                                        borderBottom: '1px solid var(--eui-border-subtle)',
                                        color: 'var(--eui-text)',
                                    }}>{item}</li>
                                ))}
                            </ul>
                        </PullToRefresh>
                    </div>
                    <div style={{
                        padding: '10px 14px',
                        background: 'var(--eui-bg-subtle)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 6,
                        fontSize: 12,
                        color: 'var(--eui-text-muted)',
                    }}>
                        Total refreshes: <strong style={{ color: 'var(--eui-text)' }}>{refreshes}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default BasicUsage;
