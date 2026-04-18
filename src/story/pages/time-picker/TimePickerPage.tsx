import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Confirm from './Confirm';
import Formats from './Formats';
import Sizes from './Sizes';
import Steps from './Steps';

import _TimePicker_props_json from './../../../components/time-picker/TimePicker.props.json';
const { timePickerProps } = _TimePicker_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Controlled and uncontrolled usage' },
    { id: 'formats', title: 'Formats', description: '12/24 hour and seconds' },
    { id: 'steps', title: 'Step Increments', description: 'Custom hour/minute/second steps' },
    { id: 'sizes', title: 'Sizes', description: 'Three trigger sizes' },
    { id: 'confirm', title: 'Confirm & Inline', description: 'Explicit confirmation and inline variant' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];


const features: FeatureItem[] = [
    {
        title: '12/24 Hour',
        description: 'Full support for 12-hour clocks with AM/PM column or straight 24-hour mode.',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        title: 'Step Increments',
        description: 'Limit minute or second columns to appointment-friendly increments like 5, 15, or 30.',
        icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5',
    },
    {
        title: 'Flexible Values',
        description: 'Accepts Date objects, HH:mm strings, or plain time objects and emits the same.',
        icon: 'M7.5 21L3 16.5m0 0L7.5 12',
    },
    {
        title: 'Inline Or Popover',
        description: 'Render as a compact input with a portal popover, or inline directly in the page.',
        icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const TimePickerPage: React.FC = () => {
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                    Time Picker
                </h1>
                <p className="text-base md:text-xl" style={subtleStyle}>
                    A configurable time picker with 12/24 hour modes, seconds, custom step increments, and an inline variant.
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

            <section id="steps" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Step Increments</h2>
                <Steps />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes</h2>
                <Sizes />
            </section>

            <section id="confirm" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Confirm & Inline</h2>
                <Confirm />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
                <CodeBlock code={`import { TimePicker } from 'fluxo-ui';\nimport type { TimePickerProps, TimePickerValue } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
                <PropsTable props={timePickerProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default TimePickerPage;
