import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import FolderNavigation from './FolderNavigation';
import UploadAndFilters from './UploadAndFilters';

import _FileBrowser_props_json from './../../../components/file-browser/FileBrowser.props.json';
const { fileBrowserProps } = _FileBrowser_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Thumbnail / list / details views' },
    { id: 'upload', title: 'Upload & Filters', description: 'Drag-drop with type/size/count limits' },
    { id: 'folders', title: 'Folder Navigation', description: 'Drill-in with breadcrumb' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const features: FeatureItem[] = [
    {
        title: 'Three views',
        description: 'Thumbnail grid, compact list and a columned details view — switch built-in or control externally.',
        icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z',
    },
    {
        title: 'Kind-aware icons',
        description: 'Image, video, audio, PDF, document, text, code and archive kinds inferred from mime type or extension.',
        icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25',
    },
    {
        title: 'Media previews',
        description: 'Image and video thumbnails with inline playback, plus a renderPreview hook to override any tile.',
        icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909',
    },
    {
        title: 'Drag-and-drop upload',
        description: 'Drop files onto the browser or pick them, with accept, maxFileSize and maxSelection filters.',
        icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
    },
    {
        title: 'Folder navigation',
        description: 'Open folders via Enter / double-click and pair with a breadcrumb for Drive-style explorers.',
        icon: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
    },
    {
        title: 'Accessible',
        description: 'Listbox / grid roles, roving tab index, arrow / Home / End navigation and Space / Enter activation.',
        icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
];

const FileBrowserPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                File Browser
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A generic, selectable file and folder browser with thumbnail, list and details views, kind-aware icons,
                image/video previews, drag-and-drop upload with filters and full keyboard navigation — for asset libraries,
                pickers and Drive / OneDrive style explorers.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="upload" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Upload &amp; Filters</h2>
            <UploadAndFilters />
        </section>

        <section id="folders" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Folder Navigation</h2>
            <FolderNavigation />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { FileBrowser } from 'fluxo-ui';\nimport type { FileBrowserProps, FileBrowserItem, FileBrowserView } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={fileBrowserProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default FileBrowserPage;
