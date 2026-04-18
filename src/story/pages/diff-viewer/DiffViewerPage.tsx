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

import _DiffViewer_props_json from './../../../components/diff-viewer/DiffViewer.props.json';
const { diffProps } = _DiffViewer_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Unified diff' },
    { id: 'variants', title: 'Variants', description: 'Split, inline, minimal, collapse' },
    { id: 'ignore', title: 'Ignore Options', description: 'Whitespace, case, empty lines' },
    { id: 'bitbucket', title: 'Interactive Viewer', description: 'File list, view switcher, and all options' },
    { id: 'large', title: 'Large Files', description: 'Virtualized rendering' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];


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
