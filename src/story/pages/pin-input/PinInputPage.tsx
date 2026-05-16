import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import Advanced from './Advanced';
import BasicUsage from './BasicUsage';
import Sizes from './Sizes';
import Variants from './Variants';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _PinInput_props_json from './../../../components/pin-input/PinInput.props.json';
const { pinInputProps } = _PinInput_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: '6-digit OTP with autofocus' },
    { id: 'variants', title: 'Variants', description: 'box, underline, soft' },
    { id: 'sizes', title: 'Sizes', description: 'Small, medium, large fields' },
    { id: 'advanced', title: 'Advanced', description: 'Grouping, masking, error state' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Auto-advance', description: 'Typing a character moves focus to the next field; Backspace moves back.', icon: MOBILE_FEATURE_ICONS.bolt },
    { title: 'Paste support', description: 'Pasting a full code distributes characters across remaining fields.', icon: MOBILE_FEATURE_ICONS.cursor },
    { title: 'Three variants', description: 'box, underline, and soft — match any form aesthetic.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Numeric / alphanumeric / password', description: 'Input mode adapts so mobile keyboards show the right layout.', icon: MOBILE_FEATURE_ICONS.keyboard },
    { title: 'One-time-code autocomplete', description: 'autoComplete="one-time-code" enables iOS SMS auto-fill.', icon: MOBILE_FEATURE_ICONS.shieldCheck },
    { title: 'Invalid state', description: 'Error styling with role=alert announcement support.', icon: MOBILE_FEATURE_ICONS.bell },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const PinInputPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>PIN / OTP Input</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A row of single-character fields that auto-advance — perfect for OTP verification, PIN entry, and short codes.
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

        <section id="advanced" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Advanced</h2>
            <Advanced />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { PinInput } from 'fluxo-ui';\nimport type { PinInputProps, PinInputVariant, PinInputSize, PinInputType } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={pinInputProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default PinInputPage;
