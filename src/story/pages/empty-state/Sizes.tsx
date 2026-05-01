import React from 'react';
import { EmptyState, EmptyStateSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<EmptyState size="sm" title="Compact" />
<EmptyState size="md" title="Comfortable" />
<EmptyState size="lg" title="Spacious" />`;

const sizes: EmptyStateSize[] = ['sm', 'md', 'lg'];

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes" description="Three sizes scale the icon, padding, and typography proportionally.">
            <div style={{ display: 'flex', gap: 16, flexDirection: 'column', width: '100%' }}>
                {sizes.map((s) => (
                    <div key={s} style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 8 }}>
                        <EmptyState
                            size={s}
                            title={`Size: ${s}`}
                            description="A short description that adapts to the chosen size."
                            action={{ label: 'Action', onClick: () => {} }}
                        />
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
