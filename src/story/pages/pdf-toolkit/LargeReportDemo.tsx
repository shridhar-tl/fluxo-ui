import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfDocument, applyFooterBand, applyHeaderBand, drawGrid } from '../../../pdf';
import { PdfPreview } from './PdfPreview';
import { currencyFormatter, salesRows } from './pdf-story-data';

const code = `import { PdfDocument, drawGrid, applyHeaderBand, applyFooterBand } from 'fluxo-ui/pdf';

const doc = new PdfDocument({ format: 'a4', orientation: 'landscape', margin: 40 });

drawGrid(doc, {
  startY: 80,
  preset: 'zebra',
  repeat: { header: 'everyPage', footer: 'lastPage' },
  columns: [
    { key: 'region', header: 'Region' },
    { key: 'representative', header: 'Representative' },
    { key: 'units', header: 'Units', style: { align: 'right' } },
    { key: 'revenue', header: 'Revenue', style: { align: 'right' } },
    { key: 'growth', header: 'Growth', style: { align: 'right' } },
    { key: 'status', header: 'Status', style: { align: 'center' } },
  ],
  body: salesRows,
  foot: [[{ value: 'Total', colSpan: 3, style: { align: 'right' } }, total, '', '']],
  onCellBeforeDraw: ({ cell }) => {
    if (cell.section === 'body' && cell.columnIndex === 5) {
      cell.style.textColor = statusColors[cell.text[0]] ?? '#334155';
    }
  },
});

applyHeaderBand(doc, { slots: [{ text: 'Regional Performance' }, { text: 'FY2026', align: 'right' }] });
applyFooterBand(doc, {
  slots: [{ text: (page, total) => \`Page \${page} of \${total}\`, align: 'right' }],
  ruleColor: '#e2e8f0',
  ruleWidth: 0.5,
});`;

const statusColors: Record<string, string> = {
    'On track': '#047857',
    'At risk': '#b45309',
    Behind: '#b91c1c',
};

const buildDocument = (): PdfDocument => {
    const doc = new PdfDocument({
        format: 'a4',
        orientation: 'landscape',
        margin: 40,
        metadata: { title: 'Regional performance report', author: 'FluxoUI' },
    });

    doc.drawText('Regional Performance', 40, 48, { fontSize: 18, bold: true, color: '#0f172a' });
    doc.drawText('Full financial year 2026, all territories', 40, 70, { fontSize: 10, color: '#64748b' });

    const totalRevenue = salesRows.reduce((sum, row) => sum + row.revenue, 0);
    const totalUnits = salesRows.reduce((sum, row) => sum + row.units, 0);

    drawGrid(doc, {
        startY: 96,
        preset: 'zebra',
        repeat: { header: 'everyPage', footer: 'lastPage' },
        columns: [
            { key: 'region', header: 'Region' },
            { key: 'representative', header: 'Representative' },
            { key: 'units', header: 'Units', width: 62, style: { align: 'right' } },
            { key: 'revenue', header: 'Revenue', width: 92, style: { align: 'right' } },
            { key: 'growth', header: 'Growth', width: 66, style: { align: 'right' } },
            { key: 'status', header: 'Status', width: 78, style: { align: 'center' } },
        ],
        body: salesRows.map((row) => ({
            region: row.region,
            representative: row.representative,
            units: row.units.toLocaleString('en-US'),
            revenue: currencyFormatter.format(row.revenue),
            growth: `${row.growth > 0 ? '+' : ''}${row.growth}%`,
            status: row.status,
        })),
        foot: [
            [
                { value: 'Total', colSpan: 2, style: { align: 'right' } },
                totalUnits.toLocaleString('en-US'),
                currencyFormatter.format(totalRevenue),
                '',
                '',
            ],
        ],
        styles: { all: { fontSize: 9 } },
        onCellBeforeDraw: ({ cell }) => {
            if (cell.section !== 'body') return;
            if (cell.columnIndex === 5) {
                cell.style.textColor = statusColors[cell.text[0]] ?? '#334155';
                cell.style.bold = true;
            }
            if (cell.columnIndex === 4) {
                cell.style.textColor = cell.text[0].startsWith('-') ? '#b91c1c' : '#047857';
            }
        },
    });

    applyHeaderBand(doc, {
        slots: [
            { text: 'FluxoUI Analytics', align: 'left' },
            { text: 'Confidential', align: 'right' },
        ],
    });

    applyFooterBand(doc, {
        slots: [
            { text: 'Generated from live data', align: 'left' },
            { text: (page, total) => `Page ${page} of ${total}`, align: 'right' },
        ],
        ruleColor: '#e2e8f0',
        ruleWidth: 0.5,
    });

    return doc;
};

const LargeReportDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Paginated Landscape Report"
            description="Forty-eight rows flowing across pages with a repeating header row, a totals footer, running header and footer bands, and conditional cell colouring."
            centered={false}
        >
            <PdfPreview build={buildDocument} fileName="regional-performance.pdf" height={560} />
        </ComponentDemo>
        <CodeBlock code={code} language="tsx" />
    </>
);

export default LargeReportDemo;
