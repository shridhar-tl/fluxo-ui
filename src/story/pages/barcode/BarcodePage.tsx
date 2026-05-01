import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Customization from './Customization';
import Formats from './Formats';

import _Barcode_props_json from './../../../components/barcode/Barcode.props.json';
const { barcodeProps } = _Barcode_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Encode text or numbers with live editor' },
    { id: 'formats', title: 'Formats', description: 'CODE128, CODE39, EAN13, EAN8, UPC, ITF' },
    { id: 'customization', title: 'Customization', description: 'Width, height, color, margin, text' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: '6 Symbologies',
        description: 'CODE128, CODE39, EAN13, EAN8, UPC, ITF — covering retail, logistics, and general use cases.',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75',
    },
    {
        title: 'Built-in Validation',
        description: 'Each format validates input and surfaces an inline error via onError; checksums are computed automatically.',
        icon: 'M12 6v6h4.5',
    },
    {
        title: 'Inline SVG',
        description: 'Renders crisp at any zoom. Foreground/background accept any CSS color including theme variables.',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const BarcodePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Barcode
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Encode any string as a 1D barcode and render it as inline SVG.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="formats" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Formats</h2>
            <Formats />
        </section>

        <section id="customization" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Customization</h2>
            <Customization />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { Barcode } from 'fluxo-ui';\nimport type { BarcodeProps, BarcodeFormat } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={barcodeProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default BarcodePage;
