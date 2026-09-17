import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfDocument, createFlow, stampPageNumbers } from '../../../pdf';
import { PdfPreview } from './PdfPreview';
import { currencyFormatter, salesRows } from './pdf-story-data';

const code = `import { PdfDocument, createFlow, stampPageNumbers } from 'fluxo-ui/pdf';

const doc = new PdfDocument({ format: 'a4', margin: 48 });
const flow = createFlow(doc, { startY: 60, gap: 10 });

flow.heading('Annual Review', { fontSize: 22 });
flow.paragraph(summary, { fontSize: 10.5, lineHeightFactor: 1.5 });
flow.rule();

flow.heading('Territory breakdown', { fontSize: 14 });
flow.grid({
  preset: 'ruled',
  columns: [...],
  body: rows,
});

flow.heading('Outlook', { fontSize: 14 });
flow.paragraph(outlook);

stampPageNumbers(doc);`;

const summary =
    'Revenue grew across every territory this year, with the strongest contribution coming from Western Europe and the Nordics. Unit volume rose faster than revenue in several regions, reflecting the shift towards the entry tier introduced in the second quarter. Margin held broadly steady after accounting for the promotional pricing that ran through the summer.';

const outlook =
    'The coming year assumes continued expansion in South Asia and East Asia, where the partner network is now established. Investment is weighted towards fulfilment capacity rather than headcount. The principal risk remains currency exposure on contracts denominated outside the reporting currency, which finance will hedge quarterly.';

const methodology =
    'Figures are drawn from the consolidated ledger as at the final day of the reporting period. Growth is stated year on year against the restated prior period. Territories are grouped by the commercial regions used for quota setting, which do not always correspond to legal entity boundaries.';

const buildDocument = (): PdfDocument => {
    const doc = new PdfDocument({
        format: 'a4',
        margin: 48,
        metadata: { title: 'Annual review', author: 'FluxoUI' },
    });

    const flow = createFlow(doc, { startY: 56, gap: 10 });

    flow.heading('Annual Review', { fontSize: 22, color: '#0f172a' });
    flow.paragraph('Financial year 2026 · Prepared for the board', {
        fontSize: 10,
        color: '#64748b',
        spacingAfter: 16,
    });

    flow.paragraph(summary, { fontSize: 10.5, lineHeightFactor: 1.55, color: '#1f2937' });
    flow.rule({ spacingAfter: 16 });

    flow.heading('Territory breakdown', { fontSize: 14, color: '#0f172a' });
    flow.grid({
        preset: 'ruled',
        columns: [
            { key: 'region', header: 'Region' },
            { key: 'representative', header: 'Representative' },
            { key: 'units', header: 'Units', width: 66, style: { align: 'right' } },
            { key: 'revenue', header: 'Revenue', width: 90, style: { align: 'right' } },
        ],
        body: salesRows.slice(0, 22).map((row) => ({
            region: row.region,
            representative: row.representative,
            units: row.units.toLocaleString('en-US'),
            revenue: currencyFormatter.format(row.revenue),
        })),
        styles: { all: { fontSize: 9 } },
        spacingAfter: 20,
    });

    flow.heading('Outlook', { fontSize: 14, color: '#0f172a' });
    flow.paragraph(outlook, { fontSize: 10.5, lineHeightFactor: 1.55, color: '#1f2937' });

    flow.heading('Methodology', { fontSize: 14, color: '#0f172a' });
    flow.paragraph(methodology, { fontSize: 10.5, lineHeightFactor: 1.55, color: '#1f2937' });

    stampPageNumbers(doc);

    return doc;
};

const FlowDocumentDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Flowing Multi-Section Document"
            description="Headings, paragraphs, rules and tables stacked in order. The composer tracks the cursor and starts a new page whenever the next block will not fit."
            centered={false}
        >
            <PdfPreview build={buildDocument} fileName="annual-review.pdf" height={560} />
        </ComponentDemo>
        <CodeBlock code={code} language="tsx" />
    </>
);

export default FlowDocumentDemo;
