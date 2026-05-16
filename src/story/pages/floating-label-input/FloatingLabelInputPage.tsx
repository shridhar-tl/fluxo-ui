import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Sizes from './Sizes';
import States from './States';
import Variants from './Variants';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _FloatingLabelInput_props_json from './../../../components/floating-label-input/FloatingLabelInput.props.json';
const { floatingLabelInputProps } = _FloatingLabelInput_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Outlined input with helper text' },
    { id: 'variants', title: 'Variants', description: 'Outlined, filled, underlined' },
    { id: 'sizes', title: 'Sizes', description: 'Small, medium, large' },
    { id: 'states', title: 'States', description: 'Icons, error, disabled' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Three variants', description: 'Outlined, filled, and underlined to match any form style.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Auto floating label', description: 'Label animates above on focus or when the field has a value.', icon: MOBILE_FEATURE_ICONS.bolt },
    { title: 'Helper & error text', description: 'Built-in supporting line that switches to alert styling on error.', icon: MOBILE_FEATURE_ICONS.bell },
    { title: 'Leading & trailing icons', description: 'Drop in any icon; label position adapts automatically.', icon: MOBILE_FEATURE_ICONS.sparkles },
    { title: 'Native input props', description: 'All standard <input> props (type, autoComplete, inputMode, etc.) pass through.', icon: MOBILE_FEATURE_ICONS.keyboard },
    { title: 'Full ARIA wiring', description: 'aria-invalid, aria-describedby, and role=alert announcement on errors.', icon: MOBILE_FEATURE_ICONS.shieldCheck },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const FloatingLabelInputPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Floating Label Input</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A Material-style text field whose label floats above the input on focus — saves a row of vertical space on mobile forms.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Variants</h2>
            <Variants />
        </section>

        <section id="sizes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes</h2>
            <Sizes />
        </section>

        <section id="states" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>States</h2>
            <States />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { FloatingLabelInput } from 'fluxo-ui';\nimport type { FloatingLabelInputProps, FloatingLabelVariant, FloatingLabelSize } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={floatingLabelInputProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default FloatingLabelInputPage;
