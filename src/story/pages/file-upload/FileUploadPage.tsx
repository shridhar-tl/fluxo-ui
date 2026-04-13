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
import ImagePreview from './ImagePreview';
import Validation from './Validation';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Drag-and-drop file upload' },
    { id: 'image-preview', title: 'Image Preview', description: 'Thumbnail previews for images' },
    { id: 'validation', title: 'Validation', description: 'Type, size, and custom validation' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const fileUploadProps = {
    accept: { type: 'string', description: 'Accepted file types (e.g. "image/*", ".pdf,.doc").' },
    multiple: { type: 'boolean', default: 'false', description: 'Allow multiple file selection.' },
    maxFileSize: { type: 'number', description: 'Maximum file size in bytes.' },
    maxFiles: { type: 'number', description: 'Maximum number of files allowed.' },
    disabled: { type: 'boolean', default: 'false', description: 'Disable the upload zone.' },
    showPreview: { type: 'boolean', default: 'true', description: 'Show image previews for uploaded files.' },
    dropzoneContent: { type: 'ReactNode', description: 'Custom content for the dropzone area.' },
    onFilesSelect: { type: '(files: File[]) => void', description: 'Called when files are selected.' },
    onFileRemove: { type: '(file: UploadFile) => void', description: 'Called when a file is removed from the list.' },
    onUpload: { type: '(file: File, onProgress: (percent: number) => void) => Promise<void>', description: 'Upload handler with progress callback.' },
    customValidator: { type: '(file: File) => string | undefined', description: 'Custom validation function returning an error message.' },
    className: { type: 'string', description: 'Additional CSS class for the container.' },
};

const features: FeatureItem[] = [
    { title: 'Drag & Drop', description: 'Drop files directly onto the upload zone with visual hover feedback.', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5' },
    { title: 'Progress Tracking', description: 'Real-time upload progress bars for each file being uploaded.', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z' },
    { title: 'Image Previews', description: 'Automatic thumbnail generation for uploaded image files.', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 17.25h.008v.008H6.75v-.008z' },
    { title: 'File Validation', description: 'Built-in type and size validation plus custom validator support.', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Multiple Files', description: 'Upload multiple files at once with configurable file count limits.', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { title: 'Accessibility', description: 'Keyboard accessible with ARIA labels and role attributes.', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
];

const FileUploadPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>FileUpload</h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A drag-and-drop file upload component with progress tracking, image previews, and validation.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="image-preview" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Image Preview</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Enable <code>showPreview</code> to display thumbnail previews for uploaded image files.
                </p>
                <ImagePreview />
            </section>

            <section id="validation" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Validation</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>accept</code>, <code>maxFileSize</code>, and <code>customValidator</code> to enforce file constraints.
                </p>
                <Validation />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { FileUpload } from 'ether-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={fileUploadProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default FileUploadPage;
