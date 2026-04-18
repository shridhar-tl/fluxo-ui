import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Variants from './Variants';

import _SignaturePad_props_json from './../../../components/signature-pad/SignaturePad.props.json';
const { sigProps } = _SignaturePad_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Sign and export' },
    { id: 'variants', title: 'Borders & Pens', description: 'Backgrounds, borders, pen colors and thicknesses' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];


const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const SignaturePadPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Signature Pad
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Canvas-based signature capture with smooth strokes, multiple border styles, backgrounds, pen colors and thicknesses, and an imperative API for export, clear, and undo.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Borders & Pens</h2>
            <Variants />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { SignaturePad } from 'fluxo-ui';\nimport type { SignaturePadProps, SignaturePadHandle } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={sigProps} />
        </section>
    </PageLayout>
);

export default SignaturePadPage;
