import React from 'react';
import { TouchRipple } from '../../../components';
import type { TouchRippleVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TouchRipple as="button" variant="material">Material</TouchRipple>
<TouchRipple as="button" variant="subtle">Subtle</TouchRipple>
<TouchRipple as="button" variant="highlight">Highlight</TouchRipple>
<TouchRipple as="button" variant="outline">Outline</TouchRipple>`;

const tileStyle: React.CSSProperties = {
    appearance: 'none',
    border: '1px solid var(--eui-border)',
    background: 'var(--eui-bg)',
    color: 'var(--eui-text)',
    padding: '16px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    cursor: 'pointer',
    minWidth: 160,
    textAlign: 'center',
};

const variants: { variant: TouchRippleVariant; label: string }[] = [
    { variant: 'material', label: 'Material' },
    { variant: 'subtle', label: 'Subtle' },
    { variant: 'highlight', label: 'Highlight' },
    { variant: 'outline', label: 'Outline' },
];

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Four ripple variants" description="Material is the standard tap ink, Subtle is fainter, Highlight uses the primary color, Outline draws a focus ring on press/focus.">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {variants.map((v) => (
                    <TouchRipple key={v.variant} as="button" style={tileStyle} variant={v.variant} ariaLabel={v.label}>
                        {v.label}
                    </TouchRipple>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Variants;
