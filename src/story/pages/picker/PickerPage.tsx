import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import InSheet from './InSheet';
import MultiColumn from './MultiColumn';
import Variants from './Variants';

import { MOBILE_FEATURE_ICONS } from '../mobile-icons';

import _Picker_props_json from './../../../components/picker/Picker.props.json';
const { pickerProps } = _Picker_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Single-column wheel picker' },
    { id: 'multi-column', title: 'Multi-Column', description: 'Time-style multi-column picker' },
    { id: 'variants', title: 'Variants', description: 'wheel, flat, compact' },
    { id: 'in-sheet', title: 'Inside a Sheet', description: 'Standard mobile selection flow' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Single or multi-column', description: 'Stack any number of columns for compound values (time, date, units).', icon: MOBILE_FEATURE_ICONS.list },
    { title: 'Wheel, flat, compact', description: 'Three visual variants — iOS wheel by default, plus alternatives.', icon: MOBILE_FEATURE_ICONS.grid },
    { title: 'Touch & scroll-snap', description: 'CSS scroll-snap powers native-feeling momentum scrolling.', icon: MOBILE_FEATURE_ICONS.cursor },
    { title: 'Keyboard arrows', description: 'Up/Down keys move the selection, respecting disabled rows.', icon: MOBILE_FEATURE_ICONS.keyboard },
    { title: 'Disabled rows', description: 'Mark individual options disabled — the picker skips them on settle.', icon: MOBILE_FEATURE_ICONS.shield },
    { title: 'ARIA listbox', description: 'Each column is a listbox with aria-activedescendant + selected options.', icon: MOBILE_FEATURE_ICONS.eye },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const PickerPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>Picker</h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A scrolling wheel picker for single or multi-column selection — the standard mobile pattern for date, time, and units.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="multi-column" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Multi-column</h2>
            <MultiColumn />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Variants</h2>
            <Variants />
        </section>

        <section id="in-sheet" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Inside a Sheet</h2>
            <InSheet />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { Picker } from 'fluxo-ui';\nimport type { PickerProps, PickerColumn, PickerOption, PickerVariant } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={pickerProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default PickerPage;
