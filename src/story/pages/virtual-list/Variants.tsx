import React, { useMemo } from 'react';
import { VirtualList } from '../../../components';
import type { VirtualListVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<VirtualList variant="divided" ... />
<VirtualList variant="card" ... />`;

interface Row { id: number; title: string; subtitle: string; }

const useRows = (count: number) =>
    useMemo<Row[]>(
        () => Array.from({ length: count }, (_, i) => ({
            id: i,
            title: `Row ${i + 1}`,
            subtitle: 'Lorem ipsum dolor sit amet',
        })),
        [count],
    );

const Preview: React.FC<{ variant: VirtualListVariant; description: string }> = ({ variant, description }) => {
    const rows = useRows(500);
    return (
        <ComponentDemo title={`variant="${variant}"`} description={description}>
            <div style={{ width: '100%', maxWidth: 480, border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                <VirtualList
                    items={rows}
                    itemHeight={variant === 'card' ? 96 : 56}
                    height={280}
                    variant={variant}
                    keyExtractor={(r) => r.id}
                    renderItem={(r) => (
                        <div style={{ padding: '10px 14px' }}>
                            <div style={{ color: 'var(--eui-text)', fontWeight: 600 }}>{r.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', marginTop: 2 }}>{r.subtitle}</div>
                        </div>
                    )}
                />
            </div>
        </ComponentDemo>
    );
};

const Variants: React.FC = () => (
    <>
        <Preview variant="plain" description="No separators — pair with custom border styling on each row." />
        <div className="mt-4"><Preview variant="divided" description="A subtle hairline between rows." /></div>
        <div className="mt-4"><Preview variant="card" description="Each row rendered as a rounded card with breathing room." /></div>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Variants;
