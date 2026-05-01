import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Configurable from './Configurable';
import Integration from './Integration';
import Variants from './Variants';

import _PasswordStrengthMeter_props_json from './../../../components/password-strength/PasswordStrengthMeter.props.json';
const { passwordStrengthMeterProps } = _PasswordStrengthMeter_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default meter wired to a password' },
    { id: 'variants', title: 'Meter Styles', description: 'Segments, bar, minimal' },
    { id: 'configurable', title: 'Configurable Rules', description: 'Length, classes, allowed chars' },
    { id: 'integration', title: 'Integrated with Password', description: 'Use the strengthMeter prop' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Configurable Rules',
        description: 'Length, character classes, allowed-symbol set, repetitions, sequences, and a common-password blocklist.',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75',
    },
    {
        title: 'Allowed-aware Tips',
        description: 'When the field disallows symbols, the meter never asks for one. Tips reflect what the field actually accepts.',
        icon: 'M9.53 16.122',
    },
    {
        title: 'Three Visual Styles',
        description: 'Segments (default), bar, or minimal — pick what matches your form density.',
        icon: 'M3.75 12h16.5',
    },
    {
        title: 'Accessible',
        description: 'Tier changes are announced via a polite live region; the bar itself is decorative.',
        icon: 'M12 6v6h4.5',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const PasswordStrengthPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Password Strength Meter
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A configurable strength meter with actionable tips that respects which characters your field actually accepts.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Meter Styles</h2>
            <Variants />
        </section>

        <section id="configurable" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Configurable Rules</h2>
            <Configurable />
        </section>

        <section id="integration" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Integrated with Password</h2>
            <Integration />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { PasswordStrengthMeter, computePasswordStrength } from 'fluxo-ui';\nimport type { PasswordStrengthMeterProps, PasswordPolicy, PasswordAllowedChars, PasswordRule } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={passwordStrengthMeterProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default PasswordStrengthPage;
