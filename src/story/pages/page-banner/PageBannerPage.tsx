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
import CustomContent from './CustomContent';
import Dismissible from './Dismissible';
import PageLevel from './PageLevel';
import WithActions from './WithActions';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'All banner types' },
    { id: 'dismissible', title: 'Dismissible', description: 'Dismiss and auto-dismiss' },
    { id: 'page-level', title: 'Page Level & Bordered', description: 'Portal and bordered variants' },
    { id: 'with-actions', title: 'With Actions', description: 'Action buttons in banners' },
    { id: 'custom-content', title: 'Custom Content', description: 'Icons, titles, rich content' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const pageBannerProps = {
    type: { type: "'info' | 'success' | 'warning' | 'error' | 'default'", default: "'info'", description: 'The visual style of the banner.' },
    message: { type: 'ReactNode', required: true, description: 'The main content of the banner. Accepts text or JSX.' },
    title: { type: 'string', description: 'An optional bold heading displayed above the message.' },
    icon: { type: 'ReactNode', description: 'Custom icon to replace the default type-based icon.' },
    showIcon: { type: 'boolean', default: 'true', description: 'Whether to display an icon in the banner.' },
    dismissible: { type: 'boolean', default: 'true', description: 'Whether the banner can be dismissed via a close button.' },
    autoDismiss: { type: 'number', description: 'Auto-dismiss after this many milliseconds. Shows a progress bar.' },
    onDismiss: { type: '() => void', description: 'Callback fired when the banner is dismissed.' },
    visible: { type: 'boolean', default: 'true', description: 'Controls the visibility of the banner externally.' },
    position: { type: "'top' | 'inline'", default: "'inline'", description: 'Position of the banner. Top sticks to viewport top.' },
    pageLevel: { type: 'boolean', default: 'false', description: 'When true, renders the banner via createPortal to document.body.' },
    pushContent: { type: 'boolean', default: 'false', description: 'When combined with pageLevel, pushes page content down.' },
    className: { type: 'string', description: 'Additional CSS class name for custom styling.' },
    actions: { type: 'ReactNode', description: 'Action buttons or elements rendered alongside the message.' },
    bordered: { type: 'boolean', default: 'false', description: 'Adds a left border accent matching the banner type color.' },
};

const features: FeatureItem[] = [
    { title: 'Five Banner Types', description: 'Info, success, warning, error, and default types with distinct colors and icons.', icon: 'M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
    { title: 'Dismissible', description: 'Banners can be dismissed manually via close button or automatically after a timer.', icon: 'M6 18L18 6M6 6l12 12' },
    { title: 'Auto-Dismiss', description: 'Set a timer with a progress bar indicator that auto-dismisses the banner.', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Page-Level Portal', description: 'Render banners at the top of the page using createPortal for global notifications.', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25' },
    { title: 'Action Buttons', description: 'Include action buttons alongside the message for immediate user interaction.', icon: 'M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59' },
    { title: 'Accessible', description: 'Uses role="alert" and aria-live="polite" for screen reader compatibility.', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
];

const PageBannerPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>PageBanner</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A versatile notification banner component with multiple types, dismissible behavior, auto-dismiss timers, page-level portals, and action buttons.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="dismissible" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Dismissible</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Control how banners are dismissed — manually via close button, automatically with a timer, or not at all.
                </p>
                <Dismissible />
            </section>

            <section id="page-level" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Page Level & Bordered</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>pageLevel</code> to render the banner at the top of the page via createPortal, or <code>bordered</code> for a left accent border.
                </p>
                <PageLevel />
            </section>

            <section id="with-actions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>With Actions</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Add action buttons using the <code>actions</code> prop for interactive banners.
                </p>
                <WithActions />
            </section>

            <section id="custom-content" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Content</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Customize icons, titles, and message content with rich JSX.
                </p>
                <CustomContent />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { PageBanner } from 'ether-ui';\nimport type { PageBannerProps, BannerType, BannerPosition } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={pageBannerProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default PageBannerPage;
