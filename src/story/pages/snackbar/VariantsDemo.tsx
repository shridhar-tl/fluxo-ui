import React from 'react';
import { Button, showSnackbar } from '../../../components';
import type { SnackbarVariant } from '../../../components/snackbar/types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const variants: { variant: SnackbarVariant; label: string; description: string }[] = [
    { variant: 'soft', label: 'Soft', description: 'A gently tinted surface with a colored title and icon. The default.' },
    { variant: 'solid', label: 'Solid', description: 'A bold filled card in the type color with white text.' },
    { variant: 'outlined', label: 'Outlined', description: 'A clean surface card framed by an accent ring.' },
    { variant: 'gradient', label: 'Gradient', description: 'A vivid diagonal fill in the type color with white text.' },
    { variant: 'accent', label: 'Accent', description: 'A surface card topped with a bold colored bar.' },
    { variant: 'glass', label: 'Glass', description: 'A frosted, translucent panel that blurs the backdrop.' },
    { variant: 'minimal', label: 'Minimal', description: 'A compact single-line chip — the shortest height.' },
    { variant: 'pill', label: 'Pill', description: 'A rounded single-line badge in the solid type color.' },
];

const code = `showSnackbar('A new version is available.', 'Update', { variant: 'soft', type: 'info' });
showSnackbar('Your changes have been saved.', 'Saved', { variant: 'solid', type: 'success' });
showSnackbar('Storage is almost full.', 'Heads up', { variant: 'accent', type: 'warning' });
showSnackbar('Copied to clipboard', undefined, { variant: 'pill', type: 'success' });
showSnackbar('Reconnecting…', undefined, { variant: 'minimal', type: 'info' });`;

const VariantsDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Visual variants"
                description="Eight looks share the same API. Single-line variants (minimal, pill) drop the title for a shorter footprint."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="flex gap-3 flex-wrap">
                        {variants.map(({ variant, label }, index) => (
                            <Button
                                key={variant}
                                variant={index % 2 === 0 ? 'primary' : 'secondary'}
                                onClick={() => {
                                    showSnackbar(`This is the ${label.toLowerCase()} variant.`, label, {
                                        variant,
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
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                        }}
                    >
                        {variants.map(({ variant, description }) => (
                            <div key={variant} style={{ fontSize: 13, color: 'var(--eui-text-muted)' }}>
                                <strong style={{ color: 'var(--eui-text)' }}>{variant}</strong> — {description}
                            </div>
                        ))}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default VariantsDemo;
