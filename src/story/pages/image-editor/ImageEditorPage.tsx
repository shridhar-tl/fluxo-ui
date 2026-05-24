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
import CropOnly from './CropOnly';
import CustomTools from './CustomTools';
import PersistedEdits from './PersistedEdits';

import _ImageEditor_props_json from './../../../components/image-editor/ImageEditor.props.json';
const { imageEditorProps } = _ImageEditor_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Full editor with all tools' },
    { id: 'crop-only', title: 'Crop Only', description: 'Single tool mode' },
    { id: 'custom-tools', title: 'Custom Tools', description: 'Selected subset of tools' },
    { id: 'persisted-edits', title: 'Persisted Edits', description: 'Save and restore editor state' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];


const features: FeatureItem[] = [
    {
        title: 'Crop & Resize',
        description: 'Freeform and preset aspect ratio cropping with drag handles.',
        icon: 'M6.13 1L6 16a2 2 0 002 2h15M1 6.13L16 6a2 2 0 012 2v15',
    },
    {
        title: 'Rotate & Flip',
        description: 'Rotate 90 degrees or flip horizontally and vertically.',
        icon: 'M3.51 15a9 9 0 102.13-9.36L1 10M1 4v6h6',
    },
    {
        title: 'Blur Regions',
        description: 'Draw blur regions to obscure sensitive areas of the image.',
        icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5',
    },
    {
        title: 'Annotations',
        description: 'Draw freehand annotations directly on the image canvas.',
        icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z',
    },
    {
        title: 'Tilt & Transparency',
        description: 'Fine-tune image tilt angle and transparency level with sliders.',
        icon: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
    },
    {
        title: 'Undo/Redo History',
        description: 'Full history stack with configurable maximum entries.',
        icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3',
    },
];

const ImageEditorPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Image Editor
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A full-featured image editor with crop, rotate, flip, blur, annotate, transparency, and tilt tools.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="crop-only" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Crop Only</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Restrict the editor to a single tool by passing a one-element array to <code>tools</code>.
                </p>
                <CropOnly />
            </section>

            <section id="custom-tools" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Tools</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Choose a subset of tools and set which tool is active by default with <code>defaultTool</code>.
                </p>
                <CustomTools />
            </section>

            <section id="persisted-edits" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Persisted Edits</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Store the snapshot from <code>onEditStateChange</code> and pass it back via <code>editState</code> to reopen the editor with crop, rotate, blur, and annotation layers intact — just like a controlled input.
                </p>
                <PersistedEdits />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { ImageEditor } from 'fluxo-ui';\nimport type { ImageEditorProps, EditorState, EditorTool, CropMode } from 'fluxo-ui';`}
                />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={imageEditorProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ImageEditorPage;
