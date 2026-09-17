import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfDocument, drawGrid, stampPageNumbers } from '../../../pdf';
import { PdfPreview } from './PdfPreview';
import { preciseCurrencyFormatter } from './pdf-story-data';

const code = `import { PdfDocument, drawGrid, stampPageNumbers } from 'fluxo-ui/pdf';

const doc = new PdfDocument({ format: 'a4', margin: 40 });

// Summary cards drawn with primitives
cards.forEach((card, index) => {
  const x = 40 + index * 132;
  doc.drawRectangle(x, 100, 122, 62, { fillColor: card.tint, radius: 8 });
  doc.drawText(card.label, x + 12, 114, { fontSize: 8, color: card.ink });
  doc.drawText(card.value, x + 12, 132, { fontSize: 16, bold: true, color: card.ink });
});

drawGrid(doc, {
  startY: 190,
  preset: 'ruled',
  columns: [
    { key: 'date', header: 'Date', width: 74 },
    { key: 'description', header: 'Description' },
    { key: 'debit', header: 'Debit', width: 78, style: { align: 'right' } },
    { key: 'credit', header: 'Credit', width: 78, style: { align: 'right' } },
    { key: 'balance', header: 'Balance', width: 84, style: { align: 'right' } },
  ],
  body: entries,
});

stampPageNumbers(doc);`;

interface LedgerEntry {
    date: string;
    description: string;
    debit: number;
    credit: number;
}

const ledger: LedgerEntry[] = [
    { date: '01 Aug 2026', description: 'Opening balance brought forward', debit: 0, credit: 0 },
    { date: '03 Aug 2026', description: 'Invoice 2026-0391 — Meridian Books', debit: 0, credit: 4250 },
    { date: '05 Aug 2026', description: 'Studio rent, August', debit: 2100, credit: 0 },
    { date: '08 Aug 2026', description: 'Cloud hosting and storage', debit: 486.4, credit: 0 },
    { date: '11 Aug 2026', description: 'Invoice 2026-0392 — Calder & Finch', debit: 0, credit: 7800 },
    { date: '14 Aug 2026', description: 'Contractor payment — illustration', debit: 1950, credit: 0 },
    { date: '16 Aug 2026', description: 'Software licences, annual renewal', debit: 1284.75, credit: 0 },
    { date: '19 Aug 2026', description: 'Invoice 2026-0393 — Harbourline', debit: 0, credit: 3120 },
    { date: '22 Aug 2026', description: 'Travel — client workshop', debit: 642.1, credit: 0 },
    { date: '25 Aug 2026', description: 'Invoice 2026-0394 — Meridian Books', debit: 0, credit: 5400 },
    { date: '27 Aug 2026', description: 'Equipment — colour calibration', debit: 890, credit: 0 },
    { date: '29 Aug 2026', description: 'Bank charges', debit: 38.5, credit: 0 },
    { date: '31 Aug 2026', description: 'Invoice 2026-0395 — Calder & Finch', debit: 0, credit: 2960 },
];

const buildDocument = (): PdfDocument => {
    const doc = new PdfDocument({
        format: 'a4',
        margin: 40,
        metadata: { title: 'Account statement — August 2026' },
    });

    doc.drawText('Account Statement', 40, 48, { fontSize: 20, bold: true, color: '#0f172a' });
    doc.drawText('1 – 31 August 2026 · Account 8842 1190', 40, 74, { fontSize: 10, color: '#64748b' });

    let running = 12480;
    const openingBalance = running;

    const rows = ledger.map((entry) => {
        running = running + entry.credit - entry.debit;
        return {
            date: entry.date,
            description: entry.description,
            debit: entry.debit > 0 ? preciseCurrencyFormatter.format(entry.debit) : '',
            credit: entry.credit > 0 ? preciseCurrencyFormatter.format(entry.credit) : '',
            balance: preciseCurrencyFormatter.format(running),
        };
    });

    const totalDebit = ledger.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = ledger.reduce((sum, entry) => sum + entry.credit, 0);

    const cards = [
        { label: 'OPENING BALANCE', value: preciseCurrencyFormatter.format(openingBalance), tint: '#f1f5f9', ink: '#0f172a' },
        { label: 'MONEY IN', value: preciseCurrencyFormatter.format(totalCredit), tint: '#dcfce7', ink: '#166534' },
        { label: 'MONEY OUT', value: preciseCurrencyFormatter.format(totalDebit), tint: '#fee2e2', ink: '#991b1b' },
        { label: 'CLOSING BALANCE', value: preciseCurrencyFormatter.format(running), tint: '#e0e7ff', ink: '#3730a3' },
    ];

    cards.forEach((card, index) => {
        const x = 40 + index * 129;
        doc.drawRectangle(x, 100, 119, 60, { fillColor: card.tint, radius: 7 });
        doc.drawText(card.label, x + 11, 114, { fontSize: 7, color: card.ink, characterSpacing: 0.5 });
        doc.drawText(card.value, x + 11, 130, { fontSize: 14, bold: true, color: card.ink });
    });

    drawGrid(doc, {
        startY: 186,
        preset: 'ruled',
        columns: [
            { key: 'date', header: 'Date', width: 74 },
            { key: 'description', header: 'Description' },
            { key: 'debit', header: 'Debit', width: 74, style: { align: 'right' } },
            { key: 'credit', header: 'Credit', width: 74, style: { align: 'right' } },
            { key: 'balance', header: 'Balance', width: 82, style: { align: 'right' } },
        ],
        body: rows,
        foot: [
            [
                { value: 'Movement this period', colSpan: 2, style: { align: 'right' } },
                preciseCurrencyFormatter.format(totalDebit),
                preciseCurrencyFormatter.format(totalCredit),
                preciseCurrencyFormatter.format(running),
            ],
        ],
        styles: { all: { fontSize: 9 } },
        onCellBeforeDraw: ({ cell }) => {
            if (cell.section !== 'body') return;
            if (cell.columnIndex === 2 && cell.text[0]) cell.style.textColor = '#b91c1c';
            if (cell.columnIndex === 3 && cell.text[0]) cell.style.textColor = '#166534';
        },
    });

    stampPageNumbers(doc);

    return doc;
};

const StatementDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Account Statement with Summary Cards"
            description="Tinted summary tiles drawn from primitives above a running-balance ledger, with debits and credits coloured by sign and a movement footer."
            centered={false}
        >
            <PdfPreview build={buildDocument} fileName="statement-august-2026.pdf" height={560} />
        </ComponentDemo>
        <CodeBlock code={code} language="tsx" />
    </>
);

export default StatementDemo;
