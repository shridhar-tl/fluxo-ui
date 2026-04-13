import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import CustomSlotChar from './CustomSlotChar';
import IncludeLiterals from './IncludeLiterals';
import InputStates from './InputStates';
import KeyboardNavigation from './KeyboardNavigation';
import { CreditCard, DateInput, Ipv4Address, LicensePlate, PhoneNumber, SsnInput, TimeInput } from './MaskExamples';
import MaskSyntax from './MaskSyntax';
import PrefilledValue from './PrefilledValue';

const maskedInputProps = {
    mask: {
        type: 'string',
        description: "Mask pattern. Use '9' for digit, 'a' for letter, '*' for alphanumeric, any other char as literal separator",
    },
    value: { type: 'string', description: 'Current value (raw or masked — component normalises it)' },
    onChange: { type: '(event: ComponentEvent<string>) => void', description: 'Called when the value changes' },
    onRawChange: {
        type: '(raw: string, masked: string) => void',
        description: 'Called with the raw (unmasked) value alongside the masked display value',
    },
    slotChar: { type: 'string', default: '_', description: 'Character shown for empty mask slots' },
    includeLiterals: {
        type: 'boolean',
        default: true,
        description: 'Whether to include literal separator characters in the onChange value',
    },
    placeholder: { type: 'string', description: 'Placeholder text' },
    required: { type: 'boolean', default: false, description: 'Mark the input as required' },
    readonly: { type: 'boolean', default: false, description: 'Make the input read-only' },
    disabled: { type: 'boolean', default: false, description: 'Disable the input' },
    autoFocus: { type: 'boolean', default: false, description: 'Auto-focus on mount' },
    id: { type: 'string', description: 'Unique id for the input element' },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'mask-syntax', title: 'Mask Syntax', description: 'Reserved characters reference' },
    { id: 'phone', title: 'Phone Number', description: 'US phone format' },
    { id: 'date', title: 'Date', description: 'MM/DD/YYYY format' },
    { id: 'time', title: 'Time', description: 'HH:MM format' },
    { id: 'ssn', title: 'SSN', description: 'Social security number' },
    { id: 'credit-card', title: 'Credit Card', description: 'Card number format' },
    { id: 'ipv4', title: 'IPv4 Address', description: 'IP address format' },
    { id: 'license-plate', title: 'License Plate', description: 'Alphanumeric mask' },
    { id: 'include-literals', title: 'Raw vs Masked', description: 'includeLiterals comparison' },
    { id: 'prefilled', title: 'Pre-filled Value', description: 'Initial value normalisation' },
    { id: 'states', title: 'States', description: 'Disabled, readonly, required' },
    { id: 'slot-char', title: 'Custom Slot Char', description: 'Override empty slot character' },
    { id: 'keyboard', title: 'Keyboard Navigation', description: 'Key behaviour reference' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Flexible Mask Syntax',
        description: "Use '9' for digits, 'a' for letters, '*' for alphanumeric, and any other char as a fixed separator",
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12',
    },
    {
        title: 'Raw Value Access',
        description: 'onRawChange gives you the unformatted value alongside the masked display string',
        icon: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
        title: 'Pre-filled Values',
        description: 'Pass a raw or masked value at mount time and the component normalises it automatically',
        icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
    },
    {
        title: 'Custom Slot Character',
        description: 'Replace the default underscore placeholder for empty slots with any character',
        icon: 'M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Keyboard Navigation',
        description: 'Arrow keys, Home, End, Backspace, Delete, and paste all work with slot-aware behaviour',
        icon: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3',
    },
    {
        title: 'includeLiterals Control',
        description: 'Choose whether onChange emits separators (e.g. dashes, spaces) or raw characters only',
        icon: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75',
    },
    {
        title: 'Accessibility',
        description: 'Keyboard-only operable, ARIA attributes, and screen-reader-friendly slot announcements',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light + 5 brand themes via CSS variables — zero extra config',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const MaskedInputPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const h2 = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const desc = cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    MaskedInput
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A controlled text input that enforces a character-by-character mask pattern. Supports digits, letters, alphanumeric
                    slots, and arbitrary literal separators with full keyboard navigation.
                </p>
            </div>

            <section id="mask-syntax" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-1', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Mask Syntax</h2>
                <p className={desc}>
                    Build a mask string using the reserved characters below. Any other character is treated as a fixed literal separator.
                </p>
                <MaskSyntax />
            </section>

            <section id="phone" className="scroll-mt-8">
                <h2 className={h2}>Phone Number</h2>
                <PhoneNumber />
            </section>

            <section id="date" className="scroll-mt-8">
                <h2 className={h2}>Date</h2>
                <DateInput />
            </section>

            <section id="time" className="scroll-mt-8">
                <h2 className={h2}>Time</h2>
                <TimeInput />
            </section>

            <section id="ssn" className="scroll-mt-8">
                <h2 className={h2}>Social Security Number</h2>
                <SsnInput />
            </section>

            <section id="credit-card" className="scroll-mt-8">
                <h2 className={h2}>Credit Card</h2>
                <CreditCard />
            </section>

            <section id="ipv4" className="scroll-mt-8">
                <h2 className={h2}>IPv4 Address</h2>
                <Ipv4Address />
            </section>

            <section id="license-plate" className="scroll-mt-8">
                <h2 className={h2}>Alphanumeric — License Plate</h2>
                <LicensePlate />
            </section>

            <section id="include-literals" className="scroll-mt-8">
                <h2 className={h2}>Raw Value vs Masked Value</h2>
                <p className={desc}>
                    Use <code className="font-mono">includeLiterals=false</code> to receive only the typed digits/letters in{' '}
                    <code className="font-mono">onChange</code>, without the separator characters.
                </p>
                <IncludeLiterals />
            </section>

            <section id="prefilled" className="scroll-mt-8">
                <h2 className={h2}>Pre-filled Value</h2>
                <p className={desc}>Pass a value prop at mount time (raw or masked) and the component normalises it into the mask.</p>
                <PrefilledValue />
            </section>

            <section id="states" className="scroll-mt-8">
                <h2 className={h2}>States</h2>
                <InputStates />
            </section>

            <section id="slot-char" className="scroll-mt-8">
                <h2 className={h2}>Custom Slot Character</h2>
                <p className={desc}>
                    Use <code className="font-mono">slotChar</code> to change the placeholder shown for empty editable slots (default is{' '}
                    <code className="font-mono">_</code>).
                </p>
                <CustomSlotChar />
            </section>

            <section id="keyboard" className="scroll-mt-8">
                <h2 className={h2}>Keyboard Navigation</h2>
                <KeyboardNavigation />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={h2}>Import</h2>
                <CodeBlock code={`import { MaskedInput } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={h2}>Props</h2>
                <PropsTable props={maskedInputProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default MaskedInputPage;
