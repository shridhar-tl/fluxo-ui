import React from 'react';
import { EmptyState, EmptyStateVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<EmptyState variant="default" title="No items yet" description="Get started by creating one." />
<EmptyState variant="noResults" title="No matches" description="Try a different search term." />
<EmptyState variant="error" title="Something went wrong" description="We couldn't load your data." action={{ label: 'Retry', onClick: () => {} }} />
<EmptyState variant="success" title="All caught up!" description="You're all set for the day." />
<EmptyState variant="restricted" title="Access denied" description="You don't have permission to view this." />
<EmptyState variant="info" title="Heads up" description="This is an informational state." />`;

const variants: { variant: EmptyStateVariant; title: string; description: string }[] = [
    { variant: 'default', title: 'No items yet', description: 'Get started by creating one.' },
    { variant: 'noResults', title: 'No matches', description: 'Try a different search term.' },
    { variant: 'error', title: 'Something went wrong', description: "We couldn't load your data." },
    { variant: 'success', title: 'All caught up!', description: "You're all set for the day." },
    { variant: 'restricted', title: 'Access denied', description: "You don't have permission to view this." },
    { variant: 'info', title: 'Heads up', description: 'This is an informational state.' },
];

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Variants" description="Six pre-styled variants pick sensible default icons and tones.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, width: '100%' }}>
                {variants.map((v) => (
                    <div
                        key={v.variant}
                        style={{
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 8,
                            background: 'var(--eui-bg-subtle)',
                        }}
                    >
                        <EmptyState
                            variant={v.variant}
                            size="sm"
                            title={v.title}
                            description={v.description}
                            action={
                                v.variant === 'error'
                                    ? { label: 'Retry', onClick: () => {} }
                                    : v.variant === 'noResults'
                                      ? { label: 'Reset filters', onClick: () => {} }
                                      : undefined
                            }
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

export default Variants;
