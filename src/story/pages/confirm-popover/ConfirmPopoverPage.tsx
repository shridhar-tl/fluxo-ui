import cn from 'classnames';
import React from 'react';
import { FeatureGrid } from '../../FeatureCard';
import type { FeatureItem } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import SetupSection from './SetupSection';
import YesNoDemo from './YesNoDemo';
import ConfirmCustomDemo from './ConfirmCustomDemo';
import InfoOkDemo from './InfoOkDemo';
import RichJsxDemo from './RichJsxDemo';
import CustomActionsDemo from './CustomActionsDemo';

const confirmPopoverProps = {
    target: {
        type: 'HTMLElement',
        required: true,
        description: 'The element the popover is anchored to (typically event.currentTarget)',
    },
    message: {
        type: 'string | ReactNode',
        required: true,
        description: 'The body message. Supports plain strings or JSX for rich content.',
    },
    title: {
        type: 'string',
        description: 'Optional heading displayed at the top of the popover.',
    },
    icon: {
        type: 'ComponentType | ReactElement',
        description: 'Optional icon shown next to the title.',
    },
    placement: {
        type: "'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight' | 'left' | 'right' | 'auto'",
        default: 'auto',
        description: "Where to place the popover relative to the target. 'auto' picks the best position based on available space.",
    },
    actions: {
        type: 'ConfirmPopoverAction[]',
        required: true,
        description: 'Buttons rendered in the footer. Each action has label, onClick, variant, and layout.',
    },
    onClose: {
        type: '() => void',
        description: 'Called when the popover is dismissed via Escape key or an outside click.',
    },
};

const staticMethodProps = {
    'Confirm.yesNo(target, message, onConfirm, onCancel?, options?)': {
        type: 'method',
        description: 'Shows a popover with Yes / No buttons. Fires onConfirm on Yes, onCancel on No.',
    },
    'Confirm.confirm(target, message, onConfirm, onCancel?, options?)': {
        type: 'method',
        description: 'Shows a popover with customisable Confirm / Cancel buttons. options accepts confirmText and cancelText.',
    },
    'Confirm.ok(target, message, onOk?, options?)': {
        type: 'method',
        description: 'Shows an informational popover with a single OK button. options accepts okText.',
    },
    'Confirm.show(options)': {
        type: 'method',
        description: 'Low-level method accepting a full ConfirmPopoverOptions object for maximum flexibility.',
    },
    'Confirm.close(id?)': {
        type: 'method',
        description: 'Programmatically close a specific popover by id, or all popovers when called without arguments.',
    },
};

const sectionNavItems: SectionNavItem[] = [
    { id: 'setup', title: 'Setup', description: 'App root setup' },
    { id: 'yes-no', title: 'Yes / No', description: 'Delete confirmation' },
    { id: 'confirm-custom', title: 'Confirm Custom', description: 'Custom button text' },
    { id: 'info-ok', title: 'Info / OK', description: 'Informational popover' },
    { id: 'rich-jsx', title: 'Rich JSX', description: 'ReactNode as message' },
    { id: 'custom-actions', title: 'Custom Actions', description: 'Low-level API' },
    { id: 'props', title: 'API Reference', description: 'Component props' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    { title: 'Anchored Positioning', description: '8 placement options with auto-fallback when space is constrained', icon: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z' },
    { title: 'Static API', description: 'Confirm.yesNo(), .confirm(), .ok(), and .show() methods callable from any handler', icon: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z' },
    { title: 'Rich JSX Messages', description: 'The message prop accepts any React node for complex, formatted content', icon: 'M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25' },
    { title: 'Custom Actions', description: 'Fully configurable action buttons with variant and layout control', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
    { title: 'Dismiss on Outside Click', description: 'Automatically closes when clicking outside or pressing Escape', icon: 'M6 18 18 6M6 6l12 12' },
    { title: 'Manager Pattern', description: 'Mount ConfirmPopoverManager once at root — no prop drilling required', icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21' },
    { title: 'Accessibility', description: 'Focus trapping, ARIA roles, and keyboard dismiss support built in', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
    { title: 'Theming', description: 'Full dark/light + 5 brand themes via CSS variables — zero extra config', icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z' },
];

const ConfirmPopoverPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Confirm Popover</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A lightweight anchored popover for confirmations, alerts, and quick messages — without a full modal.
                    Mount <code className="text-blue-400">&lt;ConfirmPopoverManager /&gt;</code> once at your app root,
                    then use the <code className="text-blue-400">Confirm</code> static API from any click handler.
                </p>
            </div>

            <section id="setup" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Setup</h2>
                <SetupSection />
            </section>

            <section id="yes-no" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Yes / No</h2>
                <YesNoDemo />
            </section>

            <section id="confirm-custom" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Confirm with custom button text</h2>
                <ConfirmCustomDemo />
            </section>

            <section id="info-ok" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Info / OK</h2>
                <InfoOkDemo />
            </section>

            <section id="rich-jsx" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Rich JSX message</h2>
                <RichJsxDemo />
            </section>

            <section id="custom-actions" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom actions via Confirm.show()</h2>
                <CustomActionsDemo />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>API Reference</h2>
                <h3 className={cn('text-lg font-semibold mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>ConfirmPopoverOptions</h3>
                <PropsTable props={confirmPopoverProps} />
                <h3 className={cn('text-lg font-semibold mt-6 mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Confirm static methods</h3>
                <PropsTable props={staticMethodProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ConfirmPopoverPage;
