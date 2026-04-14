import React from 'react';
import { SignaturePad } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<SignaturePad border="dashed" background="grid" />
<SignaturePad border="solid" background="dotted" penColor="#2563eb" thickness="bold" />
<SignaturePad border="none" background="white" thickness="thin" />`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Borders, Backgrounds & Pen Variants" description="Mix border styles, backgrounds, pen colors, and thicknesses.">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Dashed border · grid background</div>
                    <SignaturePad border="dashed" background="grid" size="md" />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Dotted background · bold blue pen</div>
                    <SignaturePad border="solid" background="dotted" penColor="#2563eb" thickness="bold" size="md" />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>No border · thin pen · with color swatches</div>
                    <SignaturePad border="none" background="white" thickness="thin" size="md" showSwatches />
                </div>
                <div>
                    <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--eui-text-muted)' }}>Full width</div>
                    <SignaturePad size="full" border="dashed" background="grid" />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
