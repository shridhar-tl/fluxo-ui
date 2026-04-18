import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import CustomToolbar from './CustomToolbar';
import ImageUploadDeferred from './ImageUploadDeferred';
import ImageUploadImmediate from './ImageUploadImmediate';
import PreviewOnly from './PreviewOnly';
import ReadOnly from './ReadOnly';
import ViewModes from './ViewModes';

import _Markdown_props_json from './../../../components/markdown/Markdown.props.json';
const { editorProps, previewProps } = _Markdown_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic Usage', description: 'Editor with split preview' },
    { id: 'views', title: 'View Modes', description: 'Edit, Split, Preview' },
    { id: 'preview-only', title: 'Preview Only', description: 'Render markdown without the editor' },
    { id: 'toolbar', title: 'Custom Toolbar', description: 'Configure toolbar actions' },
    { id: 'upload-immediate', title: 'Upload (Immediate)', description: 'Upload on selection' },
    { id: 'upload-deferred', title: 'Upload (Deferred)', description: 'Upload on submit via flushUploads' },
    { id: 'readonly', title: 'Read-only', description: 'Display-only mode' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'editor-props', title: 'MarkdownEditor Props', description: 'Editor API' },
    { id: 'preview-props', title: 'MarkdownPreview Props', description: 'Preview API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];



const features: FeatureItem[] = [
    {
        title: 'Zero Dependencies',
        description: 'Custom markdown parser and renderer with no third-party libraries.',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
        title: 'Image Uploads',
        description: 'Plug in any async upload callback. Immediate or deferred (flush on submit) strategies.',
        icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7l-9-4-9 4z',
    },
    {
        title: 'Toggle Views',
        description: 'Edit-only, preview-only, or split — with mobile tabs and keyboard shortcuts.',
        icon: 'M4 6h16M4 12h16M4 18h16',
    },
    {
        title: 'Accessible',
        description: 'Full keyboard operability, ARIA roles, focus trap in dialogs, high-contrast themes.',
        icon: 'M9 12l2 2 4-4',
    },
    {
        title: 'Configurable Toolbar',
        description: 'Pick any subset of 20+ toolbar actions, or hide the toolbar entirely.',
        icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
    },
    {
        title: 'Theme-aware',
        description: 'All colors flow from --eui-* variables — auto-supports light, dark, and brand themes.',
        icon: 'M12 3v2m0 14v2m9-9h-2M5 12H3',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const MarkdownPage: React.FC = () => {
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                    Markdown Editor & Preview
                </h1>
                <p className="text-base md:text-xl" style={subtleStyle}>
                    A zero-dependency markdown editor and renderer with toolbar configuration, image upload callbacks,
                    split view, and full dark-mode and theme support.
                </p>
            </div>

            <section id="basic" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="views" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>View Modes</h2>
                <ViewModes />
            </section>

            <section id="preview-only" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Preview Only</h2>
                <PreviewOnly />
            </section>

            <section id="toolbar" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Custom Toolbar</h2>
                <CustomToolbar />
            </section>

            <section id="upload-immediate" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Image Upload — Immediate</h2>
                <ImageUploadImmediate />
            </section>

            <section id="upload-deferred" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Image Upload — Deferred</h2>
                <ImageUploadDeferred />
            </section>

            <section id="readonly" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Read-only</h2>
                <ReadOnly />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
                <CodeBlock
                    code={`import { MarkdownEditor, MarkdownPreview } from 'fluxo-ui';
import type { MarkdownEditorProps, MarkdownEditorHandle, MarkdownPreviewProps } from 'fluxo-ui';`}
                />
            </section>

            <section id="editor-props" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>MarkdownEditor Props</h2>
                <PropsTable props={editorProps} />
            </section>

            <section id="preview-props" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>MarkdownPreview Props</h2>
                <PropsTable props={previewProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default MarkdownPage;
