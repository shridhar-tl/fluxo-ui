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
import Positions from './Positions';
import CustomContent from './CustomContent';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default right-side drawer' },
    { id: 'positions', title: 'Positions', description: 'Left, right, top, bottom' },
    { id: 'custom-content', title: 'Custom Content', description: 'Header, footer, and form' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const drawerProps = {
    open: { type: 'boolean', required: true, description: 'Whether the drawer is visible.' },
    onClose: { type: '() => void', required: true, description: 'Called when the drawer should close.' },
    position: { type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: 'Edge from which the drawer slides in.' },
    size: { type: 'string', default: "'400px'", description: 'Width (horizontal) or height (vertical) of the drawer.' },
    backdrop: { type: 'boolean', default: 'true', description: 'Show a dark backdrop behind the drawer.' },
    pushContent: { type: 'boolean', default: 'false', description: 'Push the main content instead of overlaying.' },
    closeOnEscape: { type: 'boolean', default: 'true', description: 'Close drawer on Escape key press.' },
    closeOnBackdropClick: { type: 'boolean', default: 'true', description: 'Close drawer when clicking the backdrop.' },
    header: { type: 'ReactNode', description: 'Header content. When provided, shows a header bar with close button.' },
    footer: { type: 'ReactNode', description: 'Footer content rendered at the bottom.' },
    children: { type: 'ReactNode', required: true, description: 'Main body content of the drawer.' },
    className: { type: 'string', description: 'Additional CSS class for the drawer panel.' },
};

const features: FeatureItem[] = [
    { title: 'Four Positions', description: 'Slide in from left, right, top, or bottom with smooth CSS transitions.', icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' },
    { title: 'Focus Trap', description: 'Tab key cycles through focusable elements within the drawer.', icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z' },
    { title: 'Push Content', description: 'Optionally push main content aside instead of overlaying.', icon: 'M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25' },
    { title: 'Header & Footer', description: 'Optional header with close button and footer for action buttons.', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z' },
    { title: 'Backdrop Control', description: 'Toggle backdrop visibility and close-on-click behavior.', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909' },
    { title: 'Accessibility', description: 'ARIA modal role, focus restoration, and escape key handling.', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
];

const DrawerPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Drawer</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A slide-in panel component with four positions, focus trapping, backdrop, and customizable header/footer.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="positions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Positions</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use the <code>position</code> prop to slide the drawer in from any edge.
                </p>
                <Positions />
            </section>

            <section id="custom-content" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Content</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Add a <code>header</code> and <code>footer</code> to create structured drawer layouts with action buttons.
                </p>
                <CustomContent />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { Drawer } from 'ether-ui';\nimport type { DrawerProps, DrawerPosition } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={drawerProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default DrawerPage;
