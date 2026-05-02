import React from 'react';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';

const features: FeatureItem[] = [
    {
        title: 'Vendor In, Library Out',
        description: 'Copies real component source into your repo so you can edit, review and ship without an external dependency.',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
        title: 'Transitive Resolution',
        description: 'Pulls every dependency a component needs — sub-components, hooks, utils, types, themes, even icon SVGs.',
        icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
    },
    {
        title: 'Smart Import Rewriting',
        description: 'Rewrites every relative import inside copied files so they resolve cleanly inside your project layout.',
        icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2h-3a1 1 0 01-1-1v-5H10v5a1 1 0 01-1 1H6a2 2 0 01-2-2V9z',
    },
    {
        title: 'Drift-Aware Updates',
        description: 'Tracks SHA-256 checksums for every installed file. `update` warns before overwriting your local edits.',
        icon: 'M4 4v5h5M20 20v-5h-5M5 9a7 7 0 0114-1m1 8a7 7 0 01-14 1',
    },
    {
        title: 'Interactive & Scriptable',
        description: 'Multi-select prompts when run from a TTY; fully argv/CI driven when piped or run with --force.',
        icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
        title: 'No Hidden Dependency',
        description: 'Components, theme variables and stylesheets all land in your repo. The CLI never installs the fluxo-ui npm package as a runtime dep.',
        icon: 'M5 13l4 4L19 7',
    },
    {
        title: 'SCSS or Plain CSS',
        description: 'Default install vendors .scss alongside .tsx. Pass --css to pre-compile to plain CSS so the project needs no Sass toolchain.',
        icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    },
];

const OverviewSection: React.FC = () => (
    <section className="scroll-mt-8" id="overview">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Why use fluxo-cli?</h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">fluxo-cli</code> is a separate npm package from the{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">fluxo-ui</code> library. Use it to cherry-pick
            individual components into your project as plain source files instead of installing the whole library as an npm dependency. Built for teams
            that need to vendor UI components — for compliance, customization, third-party-dep policies, or simply to own the code they ship.
        </p>
        <p className="mb-8 text-gray-600 leading-relaxed">
            Pick what you need, run it, get real <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">.tsx</code>{' '}
            files dropped into <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">./src/components/fluxo-ui/</code>{' '}
            (or wherever you point it). Re-run later to pull updates — your local edits are preserved unless you explicitly opt in to overwrite them.
            Remove components you no longer need with a single command.
        </p>
        <FeatureGrid features={features} columns={3} />
    </section>
);

export default OverviewSection;
