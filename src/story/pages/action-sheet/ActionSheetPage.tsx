import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import DestructiveStates from './DestructiveStates';
import Variants from './Variants';
import WithIcons from './WithIcons';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _ActionSheet_props_json from './../../../components/action-sheet/ActionSheet.props.json';
const { actionSheetProps } = _ActionSheet_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default iOS-style sheet' },
    { id: 'variants', title: 'Variants', description: 'iOS, Material, Plain' },
    { id: 'destructive', title: 'States', description: 'Destructive, disabled, descriptions' },
    { id: 'with-icons', title: 'With Icons', description: 'Action rows with icons' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'iOS, Material, Plain', description: 'Three visual variants covering both iOS and Android conventions plus a merged-list option.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Destructive & disabled rows', description: 'Each action can be marked destructive, disabled, or paired with a description line.', icon: MOBILE_FEATURE_ICONS.bolt },
    { title: 'Safe-area-aware', description: 'Bottom padding respects env(safe-area-inset-bottom) so the sheet clears the iOS home indicator.', icon: MOBILE_FEATURE_ICONS.devices },
    { title: 'Keyboard & focus', description: 'Escape closes, focus is trapped while open, and focus is restored to the trigger on close.', icon: MOBILE_FEATURE_ICONS.keyboard },
    { title: 'Backdrop & escape control', description: 'closeOnBackdropClick and closeOnEscape props let you tune dismissal behavior.', icon: MOBILE_FEATURE_ICONS.cursor },
    { title: 'Theme-driven colors', description: 'Surfaces and text use --eui-* variables — works across every brand theme and dark mode automatically.', icon: MOBILE_FEATURE_ICONS.palette },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const ActionSheetPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Action Sheet</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A bottom-aligned modal list of actions — ideal for mobile context menus, sharing flows, and confirmations.
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

        <section id="destructive" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>States</h2>
            <DestructiveStates />
        </section>

        <section id="with-icons" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>With Icons</h2>
            <WithIcons />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { ActionSheet } from 'fluxo-ui';\nimport type { ActionSheetProps, ActionSheetAction, ActionSheetStyle } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={actionSheetProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default ActionSheetPage;
