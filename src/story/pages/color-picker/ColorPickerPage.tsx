import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import CustomSwatches from './CustomSwatches';
import Formats from './Formats';
import Sizes from './Sizes';
import Variants from './Variants';

import _ColorPicker_props_json from './../../../components/color-picker/ColorPicker.props.json';
const { colorPickerProps } = _ColorPicker_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Controlled and uncontrolled usage' },
    { id: 'variants', title: 'Trigger Variants', description: 'Button, input, and swatch triggers' },
    { id: 'sizes', title: 'Sizes', description: 'Three trigger sizes' },
    { id: 'formats', title: 'Formats', description: 'Hex, RGB, and RGBA output' },
    { id: 'custom', title: 'Swatches & Panels', description: 'Custom palettes and panel toggles' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];


const features: FeatureItem[] = [
    {
        title: 'HSV Canvas',
        description: 'Click-and-drag saturation/value canvas with separate hue and alpha sliders.',
        icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5',
    },
    {
        title: 'Multiple Formats',
        description: 'Display and emit values in hex, rgb, or rgba depending on the format prop.',
        icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5',
    },
    {
        title: 'Custom Swatches',
        description: 'Provide your brand palette or hide swatches entirely for a minimal experience.',
        icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402',
    },
    {
        title: 'Portal Popover',
        description: 'The picker panel renders in a portal with auto-positioning and click-outside dismissal.',
        icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const ColorPickerPage: React.FC = () => {
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                    Color Picker
                </h1>
                <p className="text-base md:text-xl" style={subtleStyle}>
                    An HSV-based color picker with hue and alpha sliders, hex/RGB inputs, custom swatches, and three trigger styles.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="variants" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Trigger Variants</h2>
                <Variants />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes</h2>
                <Sizes />
            </section>

            <section id="formats" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Formats</h2>
                <Formats />
            </section>

            <section id="custom" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Swatches & Panels</h2>
                <CustomSwatches />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
                <CodeBlock code={`import { ColorPicker } from 'fluxo-ui';\nimport type { ColorPickerProps } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
                <PropsTable props={colorPickerProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ColorPickerPage;
