import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import CertificateDemo from './CertificateDemo';
import FlowDocumentDemo from './FlowDocumentDemo';
import GridPresetsDemo from './GridPresetsDemo';
import HtmlTableDemo from './HtmlTableDemo';
import InteractiveBuilderDemo from './InteractiveBuilderDemo';
import InvoiceDemo from './InvoiceDemo';
import LargeReportDemo from './LargeReportDemo';
import NavigationDemo from './NavigationDemo';
import PageSetupDemo from './PageSetupDemo';
import SpanningCellsDemo from './SpanningCellsDemo';
import StatementDemo from './StatementDemo';
import TextAndShapesDemo from './TextAndShapesDemo';

import _PdfToolkit_props_json from './../../../pdf/PdfToolkit.props.json';
const { documentOptions, textOptions, shapeStyle, gridOptions, columnDefinition, extractOptions } =
    _PdfToolkit_props_json;

const proseClass = 'text-(--eui-text-muted) leading-relaxed mb-4';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'What the toolkit does and where it runs' },
    { id: 'install', title: 'Getting Started', description: 'Import paths and a first document' },
    { id: 'invoice', title: 'Invoice', description: 'A complete billing document' },
    { id: 'statement', title: 'Account Statement', description: 'Summary cards and a running balance' },
    { id: 'text-shapes', title: 'Text & Shapes', description: 'Type, alignment and vector drawing' },
    { id: 'grid-presets', title: 'Table Presets', description: 'Every built-in table treatment' },
    { id: 'spanning', title: 'Spanning Cells', description: 'Merged headers and per-cell styling' },
    { id: 'large-report', title: 'Paginated Report', description: 'Repeating headers across pages' },
    { id: 'flow', title: 'Flowing Document', description: 'Stacked sections that paginate' },
    { id: 'certificate', title: 'Certificate', description: 'Full-bleed decorative layout' },
    { id: 'page-setup', title: 'Pages & Units', description: 'Sizes, units and watermarks' },
    { id: 'navigation', title: 'Links & Bookmarks', description: 'Navigation inside the document' },
    { id: 'html-table', title: 'HTML Table Export', description: 'Turn a live table into a PDF' },
    { id: 'builder', title: 'Interactive Builder', description: 'Generate from form input' },
    { id: 'node', title: 'Server Side', description: 'Generating documents in Node' },
    { id: 'document-options', title: 'Document Options', description: 'PdfDocument API reference' },
    { id: 'text-options', title: 'Text Options', description: 'drawText API reference' },
    { id: 'shape-options', title: 'Shape Options', description: 'Drawing API reference' },
    { id: 'grid-props', title: 'Table Options', description: 'drawGrid API reference' },
    { id: 'column-props', title: 'Column Options', description: 'Column definition reference' },
    { id: 'extract-props', title: 'Extract Options', description: 'HTML extraction reference' },
    { id: 'features', title: 'Features', description: 'Capability summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Runs Anywhere',
        description: 'The document and table engines touch no browser API, so the same code produces files in the browser and on a Node server.',
        icon: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.5 3.75-5.5 3.75-9S14.5 5.5 12 3m0 18c-2.5-2.5-3.75-5.5-3.75-9S9.5 5.5 12 3M3.5 9h17m-17 6h17',
    },
    {
        title: 'Typed Document API',
        description: 'Pages, text, images, vector paths, links and bookmarks behind a fully typed surface with no plugin registration step.',
        icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292',
    },
    {
        title: 'Table Engine',
        description: 'Column width solving, word wrapping, row and column spans, repeating headers and automatic pagination.',
        icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125M3.375 5.25h17.25',
    },
    {
        title: 'Live Table Export',
        description: 'Read a table already rendered on the page, optionally carrying its computed CSS into the document.',
        icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
    },
    {
        title: 'No Remote Code',
        description: 'Nothing is fetched or evaluated at runtime. Fonts are embedded metrics, and link schemes are checked before they are written.',
        icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z',
    },
    {
        title: 'Tree Shakes Cleanly',
        description: 'Every module resolves to its own chunk, so importing the colour helpers alone never pulls in the table or image code.',
        icon: 'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971z',
    },
];

const installCode = `# The toolkit ships with the library
npm install fluxo-ui`;

const startCode = `import { PdfDocument, drawGrid, savePdf } from 'fluxo-ui/pdf';

const doc = new PdfDocument({
  format: 'a4',
  margin: 40,
  metadata: { title: 'Monthly summary' },
});

doc.drawText('Monthly summary', 40, 50, { fontSize: 20, bold: true });

drawGrid(doc, {
  startY: 90,
  preset: 'ruled',
  columns: [
    { key: 'region', header: 'Region' },
    { key: 'revenue', header: 'Revenue', width: 90, style: { align: 'right' } },
  ],
  body: [
    { region: 'Nordics', revenue: '$42,257' },
    { region: 'East Asia', revenue: '$66,014' },
  ],
});

savePdf(doc.build(), 'summary.pdf');`;

const nodeCode = `import { writeFileSync } from 'node:fs';
import { PdfDocument, drawGrid } from 'fluxo-ui/pdf';

// No DOM is involved, so this runs unchanged on a server
const doc = new PdfDocument({ format: 'a4', margin: 40 });

doc.drawText('Nightly batch', 40, 50, { fontSize: 18, bold: true });

drawGrid(doc, {
  startY: 84,
  preset: 'zebra',
  columns: [
    { key: 'account', header: 'Account' },
    { key: 'balance', header: 'Balance', width: 90, style: { align: 'right' } },
  ],
  body: await loadAccountRows(),
});

writeFileSync('statement.pdf', doc.build());`;

const importCode = `// Document, drawing, tables, layout helpers and output — isomorphic
import {
  PdfDocument,
  drawGrid,
  createFlow,
  applyHeaderBand,
  applyFooterBand,
  applyWatermark,
  stampPageNumbers,
  savePdf,
  toBlob,
  toDataUrl,
} from 'fluxo-ui/pdf';

// Reading tables out of the DOM — browser only
import { extractTable, buildPdfFromTable, exportTableToPdf } from 'fluxo-ui/pdf/html';`;

const PdfToolkitPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <section id="overview">
                <div className="mb-2">
                    <h1
                        className={cn('text-2xl md:text-4xl font-bold mb-4', {
                            'text-gray-100': isDark,
                            'text-gray-900': !isDark,
                        })}
                    >
                        PDF Toolkit
                    </h1>
                    <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                        Create PDF documents from code, or from a table already on the page. The document and table
                        engines run unchanged in the browser and in Node.
                    </p>
                </div>
            <p className={proseClass}>
                The toolkit is split into two entry points. <code>fluxo-ui/pdf</code> holds the document model, the
                drawing primitives, the table engine and the layout helpers; it depends on nothing outside the
                language, so the same code that builds a file in the browser builds it on a server.{' '}
                <code>fluxo-ui/pdf/html</code> adds the one piece that genuinely needs a DOM: reading a table that is
                already rendered on the page.
            </p>
            <p className={proseClass}>
                Nothing is fetched or evaluated at runtime. The fourteen standard typefaces are described by embedded
                metrics rather than downloaded font files, and a link whose scheme is not http, https, mailto or tel is
                discarded when the document is written.
            </p>
            <FeatureGrid features={features} />
        </section>

        <section id="install">
            <h2>Getting Started</h2>
            <CodeBlock code={installCode} language="bash" />
            <CodeBlock code={startCode} language="tsx" />
            <h3 className="mt-5">What comes from where</h3>
            <CodeBlock code={importCode} language="tsx" />
        </section>

        <section id="invoice">
            <h2>Invoice</h2>
            <InvoiceDemo />
        </section>

        <section id="statement">
            <h2>Account Statement</h2>
            <StatementDemo />
        </section>

        <section id="text-shapes">
            <h2>Text and Shapes</h2>
            <TextAndShapesDemo />
        </section>

        <section id="grid-presets">
            <h2>Table Presets</h2>
            <GridPresetsDemo />
        </section>

        <section id="spanning">
            <h2>Spanning Cells</h2>
            <SpanningCellsDemo />
        </section>

        <section id="large-report">
            <h2>Paginated Report</h2>
            <LargeReportDemo />
        </section>

        <section id="flow">
            <h2>Flowing Document</h2>
            <FlowDocumentDemo />
        </section>

        <section id="certificate">
            <h2>Certificate</h2>
            <CertificateDemo />
        </section>

        <section id="page-setup">
            <h2>Pages and Units</h2>
            <PageSetupDemo />
        </section>

        <section id="navigation">
            <h2>Links and Bookmarks</h2>
            <NavigationDemo />
        </section>

        <section id="html-table">
            <h2>HTML Table Export</h2>
            <HtmlTableDemo />
        </section>

        <section id="builder">
            <h2>Interactive Builder</h2>
            <InteractiveBuilderDemo />
        </section>

        <section id="node">
            <h2>Server Side</h2>
            <p className={proseClass}>
                <code>build()</code> returns a <code>Uint8Array</code>, so a document can be written straight to disk,
                streamed in a response or attached to a message. Only the helpers that reach for{' '}
                <code>Blob</code>, <code>URL</code> or <code>document</code> — <code>savePdf</code>,{' '}
                <code>printPdf</code>, <code>openPdfInNewTab</code> — require a browser.
            </p>
            <CodeBlock code={nodeCode} language="tsx" />
        </section>

        <section id="document-options">
            <h2>Document Options</h2>
            <PropsTable props={documentOptions} />
        </section>

        <section id="text-options">
            <h2>Text Options</h2>
            <PropsTable props={textOptions} />
        </section>

        <section id="shape-options">
            <h2>Shape Options</h2>
            <PropsTable props={shapeStyle} />
        </section>

        <section id="grid-props">
            <h2>Table Options</h2>
            <PropsTable props={gridOptions} />
        </section>

        <section id="column-props">
            <h2>Column Options</h2>
            <p className={proseClass}>
                A column&rsquo;s <code>style</code> applies to its header, body and footer cells together, so setting{' '}
                <code>align</code> once lines a column&rsquo;s heading up with its values. <code>headerStyle</code> and{' '}
                <code>footerStyle</code> layer on top of it when one section needs to differ.
            </p>
            <PropsTable props={columnDefinition} />
        </section>

        <section id="extract-props">
            <h2>Extract Options</h2>
            <PropsTable props={extractOptions} />
        </section>

            <section id="features">
                <h2>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default PdfToolkitPage;
