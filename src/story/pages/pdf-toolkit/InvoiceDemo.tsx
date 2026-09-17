import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { buildInvoice } from './build-invoice';
import { PdfPreview } from './PdfPreview';
import { sampleInvoice } from './pdf-story-data';

const code = `import { PdfDocument, drawGrid } from 'fluxo-ui/pdf';
import { savePdf } from 'fluxo-ui/pdf';

const doc = new PdfDocument({
  format: 'a4',
  margin: 44,
  metadata: { title: 'Invoice INV-2026-0418', author: 'Northwind Studio Ltd.' },
});

const right = doc.pageWidth - doc.margin.right;

doc.drawRectangle(0, 0, doc.pageWidth, 8, { fillColor: '#4f46e5' });
doc.drawText('Northwind Studio Ltd.', doc.margin.left, 56, { fontSize: 17, bold: true });
doc.drawText('INVOICE', right, 56, {
  fontSize: 26,
  bold: true,
  color: '#4f46e5',
  align: 'right',
  anchor: 'point',
});

const table = drawGrid(doc, {
  startY: 258,
  preset: 'ruled',
  columns: [
    { key: 0, header: 'Description' },
    { key: 1, header: 'Qty', width: 44, style: { align: 'right' } },
    { key: 2, header: 'Unit price', width: 78, style: { align: 'right' } },
    { key: 3, header: 'Tax', width: 46, style: { align: 'right' } },
    { key: 4, header: 'Amount', width: 86, style: { align: 'right' } },
  ],
  body: lineItems,
});

doc.drawText('Total due', right, table.finalY + 46, { bold: true, align: 'right', anchor: 'point' });

savePdf(doc.build(), 'invoice.pdf');`;

const InvoiceDemo: React.FC = () => {
    const build = React.useCallback(() => buildInvoice(sampleInvoice), []);

    return (
        <>
            <ComponentDemo
                title="Invoice Document"
                description="A complete billing document: accent band, sender and recipient blocks, a ruled line-item table, computed tax summary, and payment footer."
                centered={false}
            >
                <PdfPreview build={build} fileName="invoice-2026-0418.pdf" height={620} />
            </ComponentDemo>
            <CodeBlock code={code} language="tsx" />
        </>
    );
};

export default InvoiceDemo;
