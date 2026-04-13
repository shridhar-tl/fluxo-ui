import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import Constraints from './Constraints';
import CustomFormat from './CustomFormat';
import DisabledState from './DisabledState';
import FirstDayOfWeek from './FirstDayOfWeek';
import PositionDemo from './PositionDemo';
import PresetDates from './PresetDates';
import QuickSelect from './QuickSelect';
import SelectionModes from './SelectionModes';
import SingleDatePicker from './SingleDatePicker';
import TodayButton from './TodayButton';
import { advancedUsageCode, basicUsageCode, quickSelectCode } from './date-range-picker-story-data';

const dateRangePickerProps = {
    value: { type: 'DateRangeValue | string | number', description: 'Selected date range [Date, Date] or range option key' },
    ranges: { type: 'RangeOption[]', description: 'Predefined quick range options' },
    onChange: { type: '(selection: DateSelectedCallbackArg) => void', description: 'Callback fired when date range selection changes' },
    onClose: { type: '() => void', description: 'Callback fired when date picker closes' },
    dateFormat: { type: 'string', default: 'MM/dd/yyyy', description: 'Date format string for display' },
    separator: { type: 'string', default: "' ~ '", description: 'Separator between start and end dates' },
    minDate: { type: 'Date', description: 'Minimum selectable date' },
    maxDate: { type: 'Date', description: 'Maximum selectable date' },
    customLabel: { type: 'string', default: 'Custom', description: 'Label for custom date range option' },
    showTodayButton: { type: 'boolean', default: false, description: 'Whether to show today button in date picker' },
    disabled: { type: 'boolean', default: false, description: 'Whether the picker is disabled' },
    placeholder: { type: 'string', description: 'Placeholder text for empty state' },
    position: { type: 'PopoverPosition', default: 'auto', description: 'Popover position: bottomStart, bottomEnd, topStart, topEnd, auto' },
    id: { type: 'string', description: 'HTML id attribute' },
    name: { type: 'string', description: 'Name attribute for form integration' },
    className: { type: 'string', description: 'CSS class name for container' },
    styles: { type: 'React.CSSProperties', description: 'Inline styles for container' },
    classNames: {
        type: '{ container?: string; control?: string; popover?: string }',
        description: 'Object with CSS classes for specific elements',
    },
    range: {
        type: 'boolean',
        default: 'true',
        description: 'When false, picker selects a single date instead of a range. Closes immediately on selection.',
    },
    selectionMode: {
        type: "'day' | 'week' | 'month' | 'year'",
        default: 'day',
        description: 'Controls what unit is selected: individual days, whole weeks, months, or years',
    },
    firstDayOfWeek: {
        type: 'number',
        default: '0',
        description: 'Day the week starts on (0=Sunday, 1=Monday, etc.). Affects calendar grid and week selection.',
    },
    args: { type: 'any', description: 'Additional arguments passed in onChange callback' },
    locale: { type: 'any', description: 'Locale configuration for date formatting' },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic Usage', description: 'Simple date range selection' },
    { id: 'preset', title: 'Preset Dates', description: 'Picker with preset values' },
    { id: 'quick-select', title: 'Quick Select', description: 'Predefined quick ranges' },
    { id: 'custom-format', title: 'Custom Format', description: 'Custom date format and separator' },
    { id: 'constraints', title: 'Constraints', description: 'Min/max date limits' },
    { id: 'today-button', title: 'Today Button', description: 'Today button and custom label' },
    { id: 'position', title: 'Position', description: 'Popover position control' },
    { id: 'disabled', title: 'Disabled', description: 'Disabled state' },
    { id: 'single-date', title: 'Single Date', description: 'Single date selection mode' },
    { id: 'selection-modes', title: 'Selection Modes', description: 'Week, month, year selection' },
    { id: 'first-day-of-week', title: 'First Day of Week', description: 'Custom week start day' },
    { id: 'usage-examples', title: 'Usage Examples', description: 'Code examples' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Calendar Interface',
        description: 'Dual-month calendar for intuitive date range selection with visual range highlighting.',
        icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
    },
    {
        title: 'Quick Select Ranges',
        description: 'Pre-built range options like Today, Last 7 Days, Last 30 Days for fast selection.',
        icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    },
    {
        title: 'Custom Formatting',
        description: 'Configure any date format string and custom separator between start and end dates.',
        icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125',
    },
    {
        title: 'Date Constraints',
        description: 'Restrict selectable dates with minDate and maxDate to enforce business rules.',
        icon: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
    },
    {
        title: 'Popover Positioning',
        description: 'Control popover placement with bottomStart, bottomEnd, topStart, topEnd, or auto.',
        icon: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z',
    },
    {
        title: 'Today Button',
        description: 'Optional today button for quick navigation back to the current date.',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Disabled State',
        description: 'Full disabled support prevents user interaction while maintaining visual clarity.',
        icon: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
    },
    {
        title: 'Theming',
        description: 'Full dark/light mode and all 5 brand themes supported automatically via CSS variables.',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const DateRangePickerPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    DateRangePicker
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A component for selecting date ranges with calendar interface and customizable formatting.
                </p>
            </div>

            <section className="scroll-mt-8" id="basic">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section className="scroll-mt-8" id="preset">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    With Preset Dates
                </h2>
                <PresetDates />
            </section>

            <section className="scroll-mt-8" id="quick-select">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Quick Select Ranges
                </h2>
                <QuickSelect />
            </section>

            <section className="scroll-mt-8" id="custom-format">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Format</h2>
                <CustomFormat />
            </section>

            <section className="scroll-mt-8" id="constraints">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Constraints</h2>
                <Constraints />
            </section>

            <section className="scroll-mt-8" id="today-button">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Today Button</h2>
                <TodayButton />
            </section>

            <section className="scroll-mt-8" id="position">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Popover Position
                </h2>
                <PositionDemo />
            </section>

            <section className="scroll-mt-8" id="disabled">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Disabled State</h2>
                <DisabledState />
            </section>

            <section className="scroll-mt-8" id="single-date">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Single Date Selection
                </h2>
                <SingleDatePicker />
            </section>

            <section className="scroll-mt-8" id="selection-modes">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Selection Modes
                </h2>
                <SelectionModes />
            </section>

            <section className="scroll-mt-8" id="first-day-of-week">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    First Day of Week
                </h2>
                <FirstDayOfWeek />
            </section>

            <section className="scroll-mt-8" id="usage-examples">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Usage Examples</h2>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className={cn('text-lg font-medium', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Basic Usage</h3>
                        <CodeBlock code={basicUsageCode} language="typescript" />
                    </div>
                    <div className="space-y-4">
                        <h3 className={cn('text-lg font-medium', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            With Quick Select Ranges
                        </h3>
                        <CodeBlock code={quickSelectCode} language="typescript" />
                    </div>
                    <div className="space-y-4">
                        <h3 className={cn('text-lg font-medium', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Advanced Usage</h3>
                        <CodeBlock code={advancedUsageCode} language="typescript" />
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { DateRangePicker } from 'fluxo-ui';`} language="typescript" />
            </section>

            <section className="scroll-mt-8" id="props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={dateRangePickerProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default DateRangePickerPage;
