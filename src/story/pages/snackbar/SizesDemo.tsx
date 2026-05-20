import React from 'react';
import { Button, showSnackbar } from '../../../components';
import type { SnackbarSize } from '../../../components/snackbar/types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sizes: { size: SnackbarSize; label: string }[] = [
    { size: 'sm', label: 'Small' },
    { size: 'md', label: 'Medium' },
    { size: 'lg', label: 'Large' },
];

const code = `showSnackbar('Compact and short.', 'Small', { size: 'sm', variant: 'soft', type: 'info' });
showSnackbar('The default footprint.', 'Medium', { size: 'md', variant: 'soft', type: 'info' });
showSnackbar('Roomier for richer messages.', 'Large', { size: 'lg', variant: 'soft', type: 'info' });`;

const SizesDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Sizes"
                description="An orthogonal size scale. sm gives a noticeably shorter snackbar and combines with any variant."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="flex gap-3 flex-wrap">
                        {sizes.map(({ size, label }) => (
                            <Button
                                key={size}
                                variant="secondary"
                                size={size}
                                onClick={() => {
                                    showSnackbar(`The ${label.toLowerCase()} snackbar size.`, label, {
                                        size,
                                        variant: 'soft',
                                        type: 'info',
                                    });
                                }}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                            color: 'var(--eui-text-muted)',
                        }}
                    >
                        Pair <strong style={{ color: 'var(--eui-text)' }}>size: 'sm'</strong> with{' '}
                        <strong style={{ color: 'var(--eui-text)' }}>variant: 'minimal'</strong> for the most compact, shortest
                        notification.
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default SizesDemo;
