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
import Categories from './Categories';
import CustomTrigger from './CustomTrigger';

import _NotificationCenter_props_json from './../../../components/notification-center/NotificationCenter.props.json';
const { notificationCenterProps, itemProps } = _NotificationCenter_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Bell icon with notification panel' },
    { id: 'categories', title: 'Categories', description: 'Tab-based category filtering' },
    { id: 'custom-trigger', title: 'Custom Trigger', description: 'Custom trigger and layout' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'item-props', title: 'NotificationItem', description: 'Item data interface' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];



const features: FeatureItem[] = [
    {
        title: 'Unread Badge',
        description: 'Auto-computed unread count displayed as a badge on the trigger.',
        icon: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
    },
    {
        title: 'Category Tabs',
        description: 'Filter notifications by category with an auto-generated "All" tab.',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    },
    {
        title: 'Mark Read',
        description: 'Mark individual or all notifications as read with a single click.',
        icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        title: 'Infinite Scroll',
        description: 'Load more notifications on scroll with onLoadMore callback.',
        icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12',
    },
    {
        title: 'Custom Trigger',
        description: 'Replace the default bell icon with any button or element.',
        icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128z',
    },
    {
        title: 'Accessibility',
        description: 'ARIA dialog, haspopup, and keyboard navigation support.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
];

const NotificationCenterPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    NotificationCenter
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A notification center component with a trigger bell, category tabs, mark-as-read, infinite scroll, and customizable
                    panel layout.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="categories" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Categories</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Pass a <code>categories</code> array to enable tab-based filtering. An "All" tab is automatically prepended.
                </p>
                <Categories />
            </section>

            <section id="custom-trigger" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Trigger</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>triggerElement</code> to replace the bell icon. Customize <code>header</code>, <code>footer</code>,{' '}
                    <code>width</code>, and <code>maxHeight</code>.
                </p>
                <CustomTrigger />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { NotificationCenter } from 'fluxo-ui';\nimport type { NotificationCenterProps, NotificationItem } from 'fluxo-ui';`}
                />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    NotificationCenter Props
                </h2>
                <PropsTable props={notificationCenterProps} />
            </section>

            <section id="item-props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    NotificationItem Interface
                </h2>
                <PropsTable props={itemProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default NotificationCenterPage;
