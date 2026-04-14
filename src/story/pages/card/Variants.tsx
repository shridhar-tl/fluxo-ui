import React from 'react';
import { Card } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Card variant="elevated" title="Elevated">...</Card>
<Card variant="outlined" title="Outlined">...</Card>
<Card variant="filled" title="Filled">...</Card>
<Card variant="ghost" title="Ghost">...</Card>
<Card variant="interactive" title="Interactive" onClick={() => {}}>...</Card>`;

const variants = [
    { v: 'elevated', desc: 'Soft shadow, no border' },
    { v: 'outlined', desc: 'Border, no shadow' },
    { v: 'filled', desc: 'Subtle background' },
    { v: 'ghost', desc: 'Transparent, just padding' },
    { v: 'interactive', desc: 'Hover lift + cursor' },
] as const;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Variants" description="Five visual styles.">
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {variants.map(({ v, desc }) => (
                    <Card
                        key={v}
                        variant={v}
                        title={v.charAt(0).toUpperCase() + v.slice(1)}
                        subtitle={desc}
                        onClick={v === 'interactive' ? () => undefined : undefined}
                    >
                        <span style={{ color: 'var(--eui-text-muted)', fontSize: 13 }}>
                            Card body content lives here.
                        </span>
                    </Card>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
