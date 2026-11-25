import React from 'react';

import datePickerPropsJson from '../../../components/date-picker/DatePicker.props.json';
import { CodeBlock } from '../../CodeBlock';
import { headingStyle, subtleStyle } from '../../demo-styles';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Constraints from './Constraints';
import CustomDays from './CustomDays';
import EventsParsing from './EventsParsing';
import FormatsLocale from './FormatsLocale';
import FormDemo from './FormDemo';
import Granularity from './Granularity';
import InlineCalendars from './InlineCalendars';
import PresetsFooter from './PresetsFooter';
import StatesSizes from './StatesSizes';

const { datePickerProps } = datePickerPropsJson;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Single date' },
    { id: 'formats', title: 'Formats & Locale', description: 'Patterns and languages' },
    { id: 'constraints', title: 'Constraints', description: 'Min, max, disabled' },
    { id: 'presets', title: 'Presets', description: 'Quick picks and footer' },
    { id: 'granularity', title: 'Month & Year', description: 'Granularity' },
    { id: 'inline', title: 'Inline', description: 'Embedded calendars' },
    { id: 'custom-days', title: 'Custom Days', description: 'Highlights and content' },
    { id: 'states', title: 'States & Sizes', description: 'Sizes, states, icons' },
    { id: 'events', title: 'Parsing & Events', description: 'parseDate, events, class hooks' },
    { id: 'form', title: 'Form', description: 'Native form support' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const sections: { id: string; title: string; content: React.ReactNode }[] = [
    { id: 'basic-usage', title: 'Basic Usage', content: <BasicUsage /> },
    { id: 'formats', title: 'Formats, Locales & Week Start', content: <FormatsLocale /> },
    { id: 'constraints', title: 'Date Constraints', content: <Constraints /> },
    { id: 'presets', title: 'Presets & Footer Actions', content: <PresetsFooter /> },
    { id: 'granularity', title: 'Month & Year Pickers', content: <Granularity /> },
    { id: 'inline', title: 'Inline & Multi-month', content: <InlineCalendars /> },
    { id: 'custom-days', title: 'Highlights & Custom Days', content: <CustomDays /> },
    { id: 'states', title: 'Sizes, States & Icons', content: <StatesSizes /> },
    { id: 'events', title: 'Custom Parsing, Events & Styling Hooks', content: <EventsParsing /> },
    { id: 'form', title: 'Form Integration', content: <FormDemo /> },
];

const DatePickerPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Date Picker
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Single date selection with typed input, a keyboard-friendly calendar, presets, min and max limits, disabled days, highlights,
                custom day rendering, month and year modes, locales, and a bottom sheet on small screens.
            </p>
        </div>

        {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                    {section.title}
                </h2>
                {section.content}
            </section>
        ))}

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Import
            </h2>
            <CodeBlock code={'import { DatePicker } from \'fluxo-ui\';\nimport type { DatePickerProps, DatePickerPreset } from \'fluxo-ui\';'} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Props
            </h2>
            <PropsTable props={datePickerProps} />
        </section>
    </PageLayout>
);

export default DatePickerPage;
