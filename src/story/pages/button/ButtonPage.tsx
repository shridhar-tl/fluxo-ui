import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import Variants from './Variants';
import Sizes from './Sizes';
import Layouts from './Layouts';
import States from './States';
import FullWidth from './FullWidth';
import WithIcons from './WithIcons';
import AsyncAction from './AsyncAction';
import CountdownTimer from './CountdownTimer';
import AsLink from './AsLink';
import Combinations from './Combinations';

const buttonProps = {
    variant: {
        type: "'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' | 'secondary'",
        default: "'default'",
        description: 'Button color variant',
    },
    size: {
        type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
        default: "'md'",
        description: 'Button size',
    },
    layout: {
        type: "'rounded' | 'default' | 'outlined' | 'plain' | 'sharp'",
        default: "'default'",
        description: 'Button layout style (default: filled with rounded corners, outlined: border with rounded corners, sharp: filled with no radius, plain: no background or border, rounded: fully rounded/pill shape)',
    },
    disabled: {
        type: 'boolean',
        default: 'false',
        description: 'Disable button interaction',
    },
    isLoading: {
        type: 'boolean',
        default: 'false',
        description: 'Show loading spinner and disable interaction',
    },
    leftIcon: {
        type: 'IconComponent | ReactElement',
        description: 'Icon to display on the left side of the button',
    },
    rightIcon: {
        type: 'IconComponent | ReactElement',
        description: 'Icon to display on the right side of the button',
    },
    label: {
        type: 'string',
        description: 'Button label text (alternative to children)',
    },
    children: {
        type: 'ReactNode',
        description: 'Button content',
    },
    onClick: {
        type: '(e: MouseEvent) => void | Promise<any>',
        description: 'Click event handler (supports async functions for automatic loading state)',
    },
    className: {
        type: 'string',
        description: 'Additional CSS classes',
    },
    loadingMessage: {
        type: 'string',
        default: "'Loading...'",
        description: 'Message to display while loading',
    },
    waitFor: {
        type: 'number',
        description: 'Countdown timer in seconds before button becomes clickable',
    },
    href: {
        type: 'string',
        description: 'URL to navigate to (renders as link)',
    },
    newTab: {
        type: 'boolean',
        default: 'false',
        description: 'Open link in new tab',
    },
    type: {
        type: "'submit' | 'link' | 'button'",
        default: "'button'",
        description: 'Button type',
    },
    ariaLabel: {
        type: 'string',
        description: 'Accessibility label',
    },
    title: {
        type: 'string',
        description: 'HTML title attribute',
    },
    id: {
        type: 'string',
        description: 'HTML id attribute',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default button example' },
    { id: 'variants', title: 'Variants', description: 'Color variants' },
    { id: 'sizes', title: 'Sizes', description: 'Button size options' },
    { id: 'layouts', title: 'Layouts', description: 'Shape and border styles' },
    { id: 'states', title: 'States', description: 'Normal, disabled, loading' },
    { id: 'full-width', title: 'Full Width', description: 'Stretch to container' },
    { id: 'with-icons', title: 'With Icons', description: 'Left and right icons' },
    { id: 'async-action', title: 'Async Action', description: 'Auto loading state' },
    { id: 'countdown', title: 'Countdown Timer', description: 'Delay before clickable' },
    { id: 'as-link', title: 'As Link', description: 'Render as anchor tag' },
    { id: 'combinations', title: 'Combinations', description: 'Variant + layout combos' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Variants', description: '7 color variants: default, primary, secondary, success, warning, danger, info', icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42' },
    { title: 'Layouts', description: '5 shape styles: default, outlined, sharp, rounded (pill), and plain', icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Z' },
    { title: 'Sizes', description: '5 size options: xs, sm, md, lg, xl for every context', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Async Support', description: 'Automatically shows loading state when onClick returns a Promise', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99' },
    { title: 'Countdown Timer', description: 'waitFor prop disables the button with a countdown for destructive actions', icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { title: 'Icon Support', description: 'Left and right icon slots accept any React element or icon component', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z' },
    { title: 'Link Mode', description: 'Renders as an anchor tag when href is provided, with optional newTab', icon: 'M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244' },
    { title: 'Accessibility', description: 'ARIA labels, keyboard focus, role and state attributes built in', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
    { title: 'Theming', description: 'Full dark/light + 5 brand themes via CSS variables — zero extra config', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const ButtonPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Button</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>A versatile button component with multiple variants, sizes, and states.</p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="variants" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Variants</h2>
                <Variants />
            </section>

            <section id="sizes" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Sizes</h2>
                <Sizes />
            </section>

            <section id="layouts" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Layouts</h2>
                <Layouts />
            </section>

            <section id="states" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>States</h2>
                <States />
            </section>

            <section id="full-width" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Full Width</h2>
                <FullWidth />
            </section>

            <section id="with-icons" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Icons</h2>
                <WithIcons />
            </section>

            <section id="async-action" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Async Action Handling</h2>
                <AsyncAction />
            </section>

            <section id="countdown" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Countdown Timer</h2>
                <CountdownTimer />
            </section>

            <section id="as-link" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>As Link</h2>
                <AsLink />
            </section>

            <section id="combinations" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Combination Examples</h2>
                <Combinations />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Button } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={buttonProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ButtonPage;
