import React, { useMemo } from 'react';
import { VirtualList } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { VirtualList } from 'fluxo-ui';

<VirtualList
    items={items}
    itemHeight={48}
    height={400}
    renderItem={(item) => <div>{item.name}</div>}
    keyExtractor={(item) => item.id}
/>`;

interface Row { id: number; name: string; email: string; }

const BasicUsage: React.FC = () => {
    const items = useMemo<Row[]>(
        () => Array.from({ length: 10_000 }, (_, i) => ({
            id: i,
            name: `Customer ${i + 1}`,
            email: `customer${i + 1}@example.com`,
        })),
        [],
    );

    return (
        <>
            <ComponentDemo title="10,000-row virtual list" description="Only the rows in the visible window are rendered, so scrolling stays smooth even with very long lists.">
                <div style={{ width: '100%', maxWidth: 480 }}>
                    <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                        <VirtualList
                            items={items}
                            itemHeight={56}
                            height={360}
                            keyExtractor={(item) => item.id}
                            renderItem={(item) => (
                                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--eui-border-subtle)' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--eui-text)' }}>{item.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>{item.email}</div>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default BasicUsage;
