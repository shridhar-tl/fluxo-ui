import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Configurable from './Configurable';
import CustomRules from './CustomRules';
import NumericPin from './NumericPin';
import Variants from './Variants';
import WithStrength from './WithStrength';

import _PasswordRequirements_props_json from './../../../components/password-requirements/PasswordRequirements.props.json';
const { passwordRequirementsProps } = _PasswordRequirements_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Live checklist with confirm-password rule' },
    { id: 'variants', title: 'Variants × Icons', description: 'Three layouts × three icon styles' },
    { id: 'configurable', title: 'Configurable Policy', description: 'Tune every built-in rule live' },
    { id: 'custom', title: 'Custom Rules', description: 'Add bespoke rules and override labels' },
    { id: 'pin', title: 'Numeric PIN', description: 'numericOnly + min/max length' },
    { id: 'strength', title: 'With Strength Meter', description: 'Bundle the strength meter inside' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Every Rule Configurable',
        description: 'Length, character classes, allowed symbol set, repeats, sequences, alpha-numeric only, numeric only, custom char set, match.',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75',
    },
    {
        title: 'Live Per-Rule State',
        description: 'Every rule shows met/unmet status the instant the user types. Length-based rules also show progress like 5/8.',
        icon: 'M9.53 16.122',
    },
    {
        title: '3 Layouts × 3 Icons',
        description: "List, inline chips, or boxed card — paired with checkmarks, dots, or numbered icons.",
        icon: 'M3.75 12h16.5',
    },
    {
        title: 'Strength Meter Slot',
        description: 'Toggle the bundled PasswordStrengthMeter on with one prop and forward any meter config.',
        icon: 'M12 6v6h4.5',
    },
    {
        title: 'Custom Rules',
        description: 'Add any rule the policy does not cover via customRules — receives both the value and confirm.',
        icon: 'M2.25 15.75',
    },
    {
        title: 'Optional & Composable',
        description: 'Use stand-alone or alongside Password — entirely opt-in, never forced on consumers.',
        icon: 'M15 19.128',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const PasswordRequirementsPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Password Requirements
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A live, configurable rules checklist that tells users exactly what they need to type — with optional confirm-password and bundled strength meter.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Variants × Icons</h2>
            <Variants />
        </section>

        <section id="configurable" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Configurable Policy</h2>
            <Configurable />
        </section>

        <section id="custom" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Custom Rules</h2>
            <CustomRules />
        </section>

        <section id="pin" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Numeric PIN</h2>
            <NumericPin />
        </section>

        <section id="strength" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>With Strength Meter</h2>
            <WithStrength />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { PasswordRequirements } from 'fluxo-ui';\nimport type { PasswordRequirementsProps, PasswordRequirementsPolicy, PasswordRequirementsRule } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={passwordRequirementsProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default PasswordRequirementsPage;
