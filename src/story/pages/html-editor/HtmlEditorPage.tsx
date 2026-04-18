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

import _HtmlEditor_props_json from './../../../components/html-editor/HtmlEditor.props.json';
const { editorProps, previewProps } = _HtmlEditor_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic Usage', description: 'WYSIWYG editor with split preview' },
    { id: 'views', title: 'View Modes', description: 'Edit, Split, Preview' },
    { id: 'preview-only', title: 'Preview Only', description: 'Render sanitized HTML' },
    { id: 'toolbar', title: 'Custom Toolbar', description: 'Configure toolbar actions' },
    { id: 'upload-immediate', title: 'Upload (Immediate)', description: 'Upload on selection' },
    { id: 'upload-deferred', title: 'Upload (Deferred)', description: 'Upload on submit via flushUploads' },
    { id: 'readonly', title: 'Read-only', description: 'Display-only mode' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'editor-props', title: 'HtmlEditor Props', description: 'Editor API' },
    { id: 'preview-props', title: 'HtmlPreview Props', description: 'Preview API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];



const features: FeatureItem[] = [
    {
        title: 'True WYSIWYG',
        description: 'contentEditable-based rich text surface — you see formatting as you type.',
        icon: 'M4 6h16M4 12h16M4 18h16',
    },
    {
        title: 'Complete formatting',
        description: 'Bold, italic, underline, strike, code, sup/sub, highlight, colors, fonts, alignment, tables, lists.',
        icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
    },
    {
        title: 'Safe by default',
        description: 'Built-in HTML sanitizer strips scripts, event handlers, and dangerous URL schemes.',
        icon: 'M9 12l2 2 4-4',
    },
    {
        title: 'Image uploads',
        description: 'Immediate or deferred uploads with paste, drop, and URL input flows.',
        icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7l-9-4-9 4z',
    },
    {
        title: 'Configurable toolbar',
        description: 'Pick any subset of 30+ toolbar actions, or hide the toolbar entirely.',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
        title: 'Theme-aware',
        description: 'All colors flow from --eui-* variables — auto-supports light, dark, and brand themes.',
        icon: 'M12 3v2m0 14v2m9-9h-2M5 12H3',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const HtmlEditorPage: React.FC = () => {
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                    HTML Editor & Preview
                </h1>
                <p className="text-base md:text-xl" style={subtleStyle}>
                    A WYSIWYG rich text editor with full formatting — inline marks, colors, fonts, alignment, lists,
                    tables, images, and a safe HTML preview renderer. Theme-aware and accessible by default.
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
                    code={`import { HtmlEditor, HtmlPreview } from 'fluxo-ui';
import type { HtmlEditorProps, HtmlEditorHandle, HtmlPreviewProps } from 'fluxo-ui';`}
                />
            </section>

            <section id="editor-props" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>HtmlEditor Props</h2>
                <PropsTable props={editorProps} />
            </section>

            <section id="preview-props" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>HtmlPreview Props</h2>
                <PropsTable props={previewProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default HtmlEditorPage;
