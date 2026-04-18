import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import ColorThresholds from './ColorThresholds';
import CountUpMode from './CountUpMode';
import DisabledState from './DisabledState';
import ImperativeControl from './ImperativeControl';
import LongDurations from './LongDurations';
import PauseOnHover from './PauseOnHover';
import RepeatAndAutoStart from './RepeatAndAutoStart';
import Sizes from './Sizes';
import Variants from './Variants';

import _CountdownTimer_props_json from './../../../components/CountdownTimer/CountdownTimer.props.json';
const { timerProps, handleProps } = _CountdownTimer_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Introduction and feature highlights' },
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default circular countdown' },
    { id: 'variants', title: 'Variants', description: 'Circular, rounded-square, triangle, linear, segmented, numeric' },
    { id: 'sizes', title: 'Sizes', description: 'Five sizes from xs to xl' },
    { id: 'color-thresholds', title: 'Color Thresholds', description: 'Auto color-shift on urgency' },
    { id: 'count-up', title: 'Count-Up Mode', description: 'Elapsed time instead of countdown' },
    { id: 'repeat-autostart', title: 'Repeat & Auto-Start', description: 'Loop and manual start' },
    { id: 'pause-on-hover', title: 'Pause on Hover', description: 'Pause automatically on mouse over' },
    { id: 'disabled', title: 'Disabled State', description: 'Disabled with custom message' },
    { id: 'long-durations', title: 'Long Durations', description: 'Hours, days — auto format promotes' },
    { id: 'imperative', title: 'Imperative Control', description: 'Control via forwarded ref' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Full API reference' },
    { id: 'handle', title: 'Ref Handle', description: 'Imperative handle methods' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: '6 Variants',
        description: 'Circular ring, rounded square, triangle, linear bar, segmented blocks, and pure numeric digit display.',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        title: '5 Sizes',
        description: 'From compact xs to large xl — all variants scale uniformly.',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Color Thresholds',
        description: 'Define percentage breakpoints to automatically shift color as urgency increases.',
        icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
    },
    {
        title: 'Count-Up / Count-Down',
        description: 'Switch between elapsed timer and deadline countdown with a single prop.',
        icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25',
    },
    {
        title: 'Repeat & Auto-Start',
        description: 'Loop the timer infinitely and control whether it starts on mount or on demand.',
        icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
    },
    {
        title: 'Pause on Hover',
        description: 'Automatically pauses the timer when the user mouses over it.',
        icon: 'M15.75 5.25v13.5m-7.5-13.5v13.5',
    },
    {
        title: 'Imperative Ref',
        description: 'Control start, pause, resume, and reset from parent code via a forwarded ref handle.',
        icon: 'M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z',
    },
    {
        title: 'Disabled State',
        description: 'Disable the timer with a customizable badge message (defaults to "Off").',
        icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    },
    {
        title: 'Smart Time Format',
        description: 'Automatically promotes display from seconds → minutes → hours → days based on duration.',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
];

const importCode = `import { CountdownTimer } from 'fluxo-ui';
import type { CountdownTimerProps, CountdownTimerHandle } from 'fluxo-ui';`;



const CountdownTimerPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <section id="overview" className="scroll-mt-8 mb-10">
            <h1 style={{ color: 'var(--eui-text)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Countdown Timer</h1>
            <p style={{ color: 'var(--eui-text-muted)', fontSize: 15, lineHeight: 1.7, maxWidth: 640 }}>
                A flexible progress-aware countdown (or count-up) timer with four display variants, five sizes,
                configurable color thresholds, pause/resume/reset controls, and an imperative ref API for external control.
            </p>
        </section>

        <section id="basic-usage" className="scroll-mt-8 mb-10">
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8 mb-10">
            <Variants />
        </section>

        <section id="sizes" className="scroll-mt-8 mb-10">
            <Sizes />
        </section>

        <section id="color-thresholds" className="scroll-mt-8 mb-10">
            <ColorThresholds />
        </section>

        <section id="count-up" className="scroll-mt-8 mb-10">
            <CountUpMode />
        </section>

        <section id="repeat-autostart" className="scroll-mt-8 mb-10">
            <RepeatAndAutoStart />
        </section>

        <section id="pause-on-hover" className="scroll-mt-8 mb-10">
            <PauseOnHover />
        </section>

        <section id="disabled" className="scroll-mt-8 mb-10">
            <DisabledState />
        </section>

        <section id="long-durations" className="scroll-mt-8 mb-10">
            <LongDurations />
        </section>

        <section id="imperative" className="scroll-mt-8 mb-10">
            <ImperativeControl />
        </section>

        <section id="import" className="scroll-mt-8 mb-10">
            <h2 style={{ color: 'var(--eui-text)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Import</h2>
            <CodeBlock code={importCode} language="tsx" />
        </section>

        <section id="props" className="scroll-mt-8 mb-10">
            <h2 style={{ color: 'var(--eui-text)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Props</h2>
            <PropsTable props={timerProps} />
        </section>

        <section id="handle" className="scroll-mt-8 mb-10">
            <h2 style={{ color: 'var(--eui-text)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Ref Handle (CountdownTimerHandle)</h2>
            <PropsTable props={handleProps} />
        </section>

        <section id="features" className="scroll-mt-8 mb-10">
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default CountdownTimerPage;
