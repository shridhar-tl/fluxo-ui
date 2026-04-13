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
import CollapsedItems from './CollapsedItems';
import CustomSeparator from './CustomSeparator';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple breadcrumb trail' },
    { id: 'collapsed', title: 'Collapsed Items', description: 'Ellipsis dropdown for long paths' },
    { id: 'separator', title: 'Custom Separator', description: 'Custom separator elements' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'item-props', title: 'BreadcrumbItem', description: 'Item data interface' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const breadcrumbProps = {
    items: { type: 'BreadcrumbItem[]', required: true, description: 'Array of breadcrumb items to display.' },
    separator: { type: 'ReactNode', default: "'/'", description: 'Custom separator between items.' },
    maxItems: { type: 'number', description: 'Maximum visible items before collapsing middle items into ellipsis.' },
    className: { type: 'string', description: 'Additional CSS class for the nav container.' },
    onItemClick: { type: '(item: BreadcrumbItem, index: number) => void', description: 'Called when any breadcrumb item is clicked.' },
};

const itemProps = {
    label: { type: 'string', required: true, description: 'Display text for the breadcrumb.' },
    href: { type: 'string', description: 'URL for the breadcrumb link.' },
    icon: { type: 'ReactNode', description: 'Icon displayed before the label.' },
    onClick: { type: '() => void', description: 'Click handler for the item.' },
};

const features: FeatureItem[] = [
    { title: 'Auto Collapse', description: 'Long breadcrumb trails collapse middle items into an expandable ellipsis menu.', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12' },
    { title: 'Custom Separators', description: 'Use any ReactNode as a separator: text, icons, or custom elements.', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Link & Button Modes', description: 'Items render as anchor tags (with href) or buttons (with onClick).', icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' },
    { title: 'Active Page', description: 'The last item is automatically styled as the current page with aria-current.', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z' },
    { title: 'Icon Support', description: 'Each item can display an icon alongside its label.', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909' },
    { title: 'Accessibility', description: 'Semantic nav/ol markup with aria-label and aria-current attributes.', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
];

const BreadcrumbPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Breadcrumb</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A navigation breadcrumb component with collapsible items, custom separators, and accessible markup.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="collapsed" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Collapsed Items</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Set <code>maxItems</code> to collapse middle items into an ellipsis that expands into a dropdown on click.
                </p>
                <CollapsedItems />
            </section>

            <section id="separator" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Separator</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use the <code>separator</code> prop to customize the divider between breadcrumb items.
                </p>
                <CustomSeparator />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Breadcrumb } from 'ether-ui';\nimport type { BreadcrumbItem, BreadcrumbProps } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Breadcrumb Props</h2>
                <PropsTable props={breadcrumbProps} />
            </section>

            <section id="item-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>BreadcrumbItem Interface</h2>
                <PropsTable props={itemProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default BreadcrumbPage;
