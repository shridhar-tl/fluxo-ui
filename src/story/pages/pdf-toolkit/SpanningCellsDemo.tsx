import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfDocument, drawGrid } from '../../../pdf';
import { PdfPreview } from './PdfPreview';

const code = `import { PdfDocument, drawGrid } from 'fluxo-ui/pdf';

drawGrid(doc, {
  startY: 60,
  preset: 'boxed',
  head: [
    [
      { value: 'Team', rowSpan: 2 },
      { value: 'First half', colSpan: 2, style: { align: 'center' } },
      { value: 'Second half', colSpan: 2, style: { align: 'center' } },
      { value: 'Total', rowSpan: 2, style: { align: 'right' } },
    ],
    ['Q1', 'Q2', 'Q3', 'Q4'],
  ],
  body: [
    ['Platform', '18', '24', '31', '29', '102'],
    ['Design', '12', '9', '15', '18', '54'],
  ],
  foot: [[{ value: 'All teams', colSpan: 5, style: { align: 'right' } }, '156']],
});`;

const buildDocument = (): PdfDocument => {
    const doc = new PdfDocument({ format: 'a4', margin: 44, metadata: { title: 'Spanning cells' } });

    doc.drawText('Merged headers and spanning cells', 44, 50, { fontSize: 15, bold: true, color: '#0f172a' });

    const rows: { team: string; quarters: [number, number, number, number] }[] = [
        { team: 'Platform', quarters: [18, 24, 31, 29] },
        { team: 'Design', quarters: [12, 9, 15, 18] },
        { team: 'Research', quarters: [6, 8, 7, 11] },
        { team: 'Infrastructure', quarters: [21, 19, 26, 24] },
        { team: 'Support', quarters: [14, 16, 13, 17] },
    ];

    const quarterTotals = [0, 0, 0, 0];
    for (const row of rows) {
        for (let index = 0; index < 4; index += 1) {
            quarterTotals[index] += row.quarters[index];
        }
    }
    const grandTotal = quarterTotals.reduce((sum, value) => sum + value, 0);

    const right = { align: 'right' } as const;

    const table = drawGrid(doc, {
        startY: 78,
        preset: 'boxed',
        columns: [
            { key: 0, header: 'Team' },
            { key: 1, width: 52, style: right, headerStyle: right },
            { key: 2, width: 52, style: right, headerStyle: right },
            { key: 3, width: 52, style: right, headerStyle: right },
            { key: 4, width: 52, style: right, headerStyle: right },
            { key: 5, width: 62, style: right, headerStyle: right },
        ],
        head: [
            [
                { value: 'Team', rowSpan: 2, style: { verticalAlign: 'middle' } },
                { value: 'First half', colSpan: 2, style: { align: 'center' } },
                { value: 'Second half', colSpan: 2, style: { align: 'center' } },
                { value: 'Total', rowSpan: 2, style: { align: 'right', verticalAlign: 'middle' } },
            ],
            [
                { value: 'Q1', style: right },
                { value: 'Q2', style: right },
                { value: 'Q3', style: right },
                { value: 'Q4', style: right },
            ],
        ],
        body: rows.map((row) => {
            const total = row.quarters.reduce((sum, value) => sum + value, 0);
            return [row.team, ...row.quarters.map(String), String(total)];
        }),
        foot: [
            [
                { value: 'All teams', style: { align: 'right' } },
                String(quarterTotals[0]),
                String(quarterTotals[1]),
                String(quarterTotals[2]),
                String(quarterTotals[3]),
                String(grandTotal),
            ],
        ],
        styles: { all: { fontSize: 9.5 } },
    });

    doc.drawText('Per-cell overrides', 44, table.finalY + 30, { fontSize: 15, bold: true, color: '#0f172a' });

    drawGrid(doc, {
        startY: table.finalY + 56,
        preset: 'minimal',
        columns: [
            { key: 0, header: 'Check' },
            { key: 1, header: 'Result', width: 110, style: { align: 'center' } },
            { key: 2, header: 'Notes' },
        ],
        body: [
            ['Contrast ratio', { value: 'Pass', style: { background: '#dcfce7', textColor: '#166534', bold: true } }, 'Exceeds 4.5:1 throughout'],
            ['Keyboard traversal', { value: 'Pass', style: { background: '#dcfce7', textColor: '#166534', bold: true } }, 'All controls reachable'],
            ['Focus visibility', { value: 'Review', style: { background: '#fef9c3', textColor: '#854d0e', bold: true } }, 'Outline is faint on the amber theme'],
            ['Motion preference', { value: 'Fail', style: { background: '#fee2e2', textColor: '#991b1b', bold: true } }, 'Carousel ignores reduced motion'],
        ],
        styles: { all: { fontSize: 9.5, padding: 7 } },
    });

    return doc;
};

const SpanningCellsDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Spanning Cells and Per-Cell Styling"
            description="Two-level merged headers using rowSpan and colSpan, a totals footer, and individual cells carrying their own background, colour and weight."
            centered={false}
        >
            <PdfPreview build={buildDocument} fileName="spanning-cells.pdf" height={560} />
        </ComponentDemo>
        <CodeBlock code={code} language="tsx" />
    </>
);

export default SpanningCellsDemo;
