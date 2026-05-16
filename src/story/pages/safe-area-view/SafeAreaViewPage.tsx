import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import EdgesAndModes from './EdgesAndModes';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _SafeAreaView_props_json from './../../../components/safe-area-view/SafeAreaView.props.json';
const { safeAreaViewProps } = _SafeAreaView_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Mock device with notch & home bar' },
    { id: 'edges', title: 'Edges & Modes', description: 'Per-edge control + padding/margin' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'env(safe-area-inset-*)', description: 'Reads native iOS safe-area insets via the standard CSS env() values.', icon: MOBILE_FEATURE_ICONS.devices },
    { title: 'Per-edge control', description: "Apply to any combination: top / right / bottom / left / horizontal / vertical / all.", icon: MOBILE_FEATURE_ICONS.layers },
    { title: 'Padding or margin', description: 'mode="padding" (default) pushes content inward; mode="margin" pushes the wrapper itself.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Polymorphic', description: "Render as any element via as= ('main', 'section', 'header', 'footer', …).", icon: MOBILE_FEATURE_ICONS.sparkles },
    { title: 'Optional fill background', description: 'Set fillBackground to extend --eui-bg behind the wrapper so notch areas look consistent.', icon: MOBILE_FEATURE_ICONS.palette },
    { title: 'Zero JS overhead', description: 'Purely CSS variables — no resize observers or measurement work.', icon: MOBILE_FEATURE_ICONS.bolt },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const SafeAreaViewPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Safe Area View</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A lightweight wrapper that applies <code>env(safe-area-inset-*)</code> padding (or margin) so UI clears iOS notches, status bars, and the home indicator.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="edges" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Edges & Modes</h2>
            <EdgesAndModes />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { SafeAreaView } from 'fluxo-ui';\nimport type { SafeAreaViewProps, SafeAreaEdge, SafeAreaMode } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={safeAreaViewProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default SafeAreaViewPage;
