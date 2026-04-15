import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import InteractiveViewer from './InteractiveViewer';
import IgnoreOptions from './IgnoreOptions';
import LargeFile from './LargeFile';
import Variants from './Variants';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Unified diff' },
    { id: 'variants', title: 'Variants', description: 'Split, inline, minimal, collapse' },
    { id: 'ignore', title: 'Ignore Options', description: 'Whitespace, case, empty lines' },
    { id: 'bitbucket', title: 'Interactive Viewer', description: 'File list, view switcher, and all options' },
    { id: 'large', title: 'Large Files', description: 'Virtualized rendering' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const diffProps = {
    oldValue: { type: 'string', description: 'The old/before text.' },
    newValue: { type: 'string', description: 'The new/after text.' },
    variant: { type: "'unified' | 'split' | 'inline' | 'minimal'", default: "'unified'", description: 'Diff display style.' },
    oldTitle: { type: 'string', description: 'Header label for the old side.' },
    newTitle: { type: 'string', description: 'Header label for the new side.' },
    showLineNumbers: { type: 'boolean', default: 'true', description: 'Show gutter line numbers.' },
    wordDiff: { type: 'boolean', default: 'true', description: 'Highlight word-level changes inside replaced lines.' },
    collapseUnchanged: { type: 'boolean | number', default: 'false', description: 'Fold unchanged runs. A number sets the context line count (default 3).' },
    maxHeight: { type: 'number | string', default: '480', description: 'Max scroll viewport height.' },
    ignoreWhitespace: { type: 'boolean', default: 'false', description: 'Collapse whitespace runs when comparing.' },
    ignoreCase: { type: 'boolean', default: 'false', description: 'Case-insensitive comparison.' },
    ignoreEmptyLines: { type: 'boolean', default: 'false', description: 'Treat blank lines as equal.' },
    maxLines: { type: 'number', description: 'Stop comparing after N lines. Larger files are truncated with a footer notice.' },
    rowHeight: { type: 'number', default: '22', description: 'Row pixel height used for virtualization.' },
    highlight: { type: '(line: string) => ReactNode', description: 'Custom syntax-highlight hook.' },
};

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const DiffViewerPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Diff Viewer
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                High-performance text diff viewer with unified, split, inline, and minimal variants. Handles very large files via row virtualization, supports ignore options and a configurable comparison cap.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Variants</h2>
            <Variants />
        </section>

        <section id="ignore" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Ignore Options</h2>
            <IgnoreOptions />
        </section>

        <section id="bitbucket" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Interactive Viewer</h2>
            <InteractiveViewer />
        </section>

        <section id="large" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Large Files</h2>
            <LargeFile />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { DiffViewer } from 'fluxo-ui';\nimport type { DiffViewerProps, DiffVariant } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={diffProps} />
        </section>
    </PageLayout>
);

export default DiffViewerPage;
