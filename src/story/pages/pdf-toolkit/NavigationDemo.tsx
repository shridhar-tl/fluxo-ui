import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfDocument, drawGrid } from '../../../pdf';
import { PdfPreview } from './PdfPreview';

const code = `import { PdfDocument } from 'fluxo-ui/pdf';

const doc = new PdfDocument({ format: 'a4' });

// A clickable external link
doc.drawText('Read the documentation', 40, 120, { color: '#1d4ed8', underline: true });
doc.addLink(40, 120, 150, 14, { url: 'https://example.com/docs' });

// A jump to another page in the same document
doc.addLink(40, 150, 120, 14, { pageIndex: 2, tooltip: 'Go to appendix' });

// A bookmark tree for the reader's sidebar
doc.addOutline({
  title: 'Introduction',
  pageIndex: 0,
  children: [{ title: 'Scope', pageIndex: 0 }],
});
doc.addOutline({ title: 'Appendix', pageIndex: 2 });

// Links with an unsafe scheme are dropped rather than written
doc.addLink(40, 200, 100, 14, { url: 'javascript:alert(1)' });`;

const sections = [
    { title: 'Introduction', body: 'This document demonstrates the navigation features available to a reader: external links, internal jumps between pages and a bookmark tree.' },
    { title: 'Reference tables', body: 'Bookmarks can point at any page, and a table of contents can be assembled from the same data used to lay the document out.' },
    { title: 'Appendix', body: 'The final section is reachable from the contents list on the first page as well as from the bookmark sidebar.' },
];

const buildDocument = (): PdfDocument => {
    const doc = new PdfDocument({
        format: 'a4',
        margin: 48,
        metadata: { title: 'Navigation features', author: 'FluxoUI' },
    });

    doc.drawText('Navigation', 48, 56, { fontSize: 22, bold: true, color: '#0f172a' });
    doc.drawText('Links, internal jumps and bookmarks', 48, 82, { fontSize: 10, color: '#64748b' });

    doc.drawText('Contents', 48, 118, { fontSize: 13, bold: true, color: '#0f172a' });

    let cursor = 142;
    sections.forEach((section, index) => {
        const label = `${index + 1}.  ${section.title}`;
        doc.drawText(label, 48, cursor, { fontSize: 11, color: '#1d4ed8' });
        doc.drawText(`page ${index + 1}`, 300, cursor, { fontSize: 11, color: '#94a3b8' });
        doc.addLink(48, cursor, 240, 14, { pageIndex: index, tooltip: `Jump to ${section.title}` });
        cursor += 22;
    });

    cursor += 12;
    doc.drawText('External resources', 48, cursor, { fontSize: 13, bold: true, color: '#0f172a' });
    cursor += 24;

    const links = [
        { label: 'Project documentation', url: 'https://example.com/docs' },
        { label: 'Send feedback by email', url: 'mailto:hello@example.com' },
    ];

    for (const link of links) {
        doc.drawText(link.label, 48, cursor, { fontSize: 11, color: '#1d4ed8', underline: true });
        const width = doc.measureText(link.label, { fontSize: 11 });
        doc.addLink(48, cursor, width, 14, { url: link.url, tooltip: link.url });
        cursor += 22;
    }

    cursor += 14;
    doc.drawText(
        'A link carrying an unsafe scheme is discarded when the document is written, so a value coming from user input can never become an executable action.',
        48,
        cursor,
        { fontSize: 9.5, color: '#64748b', maxWidth: doc.contentWidth, lineHeightFactor: 1.5 },
    );

    sections.forEach((section, index) => {
        if (index > 0) doc.addPage();
        if (index === 0) return;

        doc.drawText(section.title, 48, 56, { fontSize: 18, bold: true, color: '#0f172a' });
        doc.drawText(section.body, 48, 86, {
            fontSize: 10.5,
            color: '#1f2937',
            maxWidth: doc.contentWidth,
            lineHeightFactor: 1.55,
        });

        if (index === 1) {
            drawGrid(doc, {
                startY: 140,
                preset: 'lined',
                columns: [
                    { key: 0, header: 'Feature' },
                    { key: 1, header: 'Availability', width: 130, style: { align: 'center' } },
                ],
                body: [
                    ['External links', 'Yes'],
                    ['Internal page jumps', 'Yes'],
                    ['Bookmark tree', 'Yes'],
                    ['Nested bookmarks', 'Yes'],
                ],
                styles: { all: { fontSize: 9.5 } },
            });
        }
    });

    doc.addOutline({
        title: 'Introduction',
        pageIndex: 0,
        children: [
            { title: 'Contents', pageIndex: 0, y: 118 },
            { title: 'External resources', pageIndex: 0, y: 220 },
        ],
    });
    doc.addOutline({ title: 'Reference tables', pageIndex: 1 });
    doc.addOutline({ title: 'Appendix', pageIndex: 2 });

    return doc;
};

const NavigationDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Links, Jumps and Bookmarks"
            description="A contents list that jumps between pages, external links, and a nested bookmark tree shown in the reader's sidebar. Unsafe link schemes are refused."
            centered={false}
        >
            <PdfPreview build={buildDocument} fileName="navigation.pdf" height={520} />
        </ComponentDemo>
        <CodeBlock code={code} language="tsx" />
    </>
);

export default NavigationDemo;
