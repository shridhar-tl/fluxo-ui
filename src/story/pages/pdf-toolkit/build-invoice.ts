import { PdfDocument } from '../../../pdf';
import { drawGrid } from '../../../pdf';
import { type InvoiceRecord, invoiceTotals, preciseCurrencyFormatter } from './pdf-story-data';

const accentColor = '#4f46e5';
const mutedColor = '#6b7280';
const inkColor = '#111827';

export function buildInvoice(invoice: InvoiceRecord): PdfDocument {
    const doc = new PdfDocument({
        format: 'a4',
        margin: 44,
        metadata: {
            title: `Invoice ${invoice.number}`,
            author: invoice.seller.name,
            subject: `Invoice for ${invoice.buyer.name}`,
        },
    });

    const left = doc.margin.left;
    const right = doc.pageWidth - doc.margin.right;

    doc.drawRectangle(0, 0, doc.pageWidth, 8, { fillColor: accentColor });

    doc.drawText(invoice.seller.name, left, 56, { fontSize: 17, bold: true, color: inkColor });
    doc.drawText(invoice.seller.addressLines.join('\n'), left, 78, { fontSize: 9, color: mutedColor });
    doc.drawText(`${invoice.seller.email}    VAT ${invoice.seller.taxId}`, left, 116, { fontSize: 9, color: mutedColor });

    const headerBoxWidth = 220;
    const headerBoxLeft = right - headerBoxWidth;

    doc.drawText('INVOICE', headerBoxLeft, 56, {
        fontSize: 26,
        bold: true,
        color: accentColor,
        align: 'right',
        maxWidth: headerBoxWidth,
    });
    doc.drawText(invoice.number, headerBoxLeft, 88, {
        fontSize: 11,
        bold: true,
        align: 'right',
        maxWidth: headerBoxWidth,
        color: inkColor,
    });
    doc.drawText(`Issued ${invoice.issuedOn}`, headerBoxLeft, 106, {
        fontSize: 9,
        align: 'right',
        maxWidth: headerBoxWidth,
        color: mutedColor,
    });
    doc.drawText(`Due ${invoice.dueOn}`, headerBoxLeft, 119, {
        fontSize: 9,
        align: 'right',
        maxWidth: headerBoxWidth,
        color: mutedColor,
    });

    doc.drawLine(left, 142, right, 142, { strokeColor: '#e5e7eb', lineWidth: 0.75 });

    doc.drawText('BILL TO', left, 158, { fontSize: 8, bold: true, color: mutedColor, characterSpacing: 0.6 });
    doc.drawText(invoice.buyer.name, left, 174, { fontSize: 12, bold: true, color: inkColor });
    doc.drawText(invoice.buyer.addressLines.join('\n'), left, 192, { fontSize: 9, color: mutedColor });
    doc.drawText(invoice.buyer.email, left, 230, { fontSize: 9, color: mutedColor });

    const totals = invoiceTotals(invoice);

    const body = invoice.items.map((item) => [
        { value: `${item.description}\n${item.detail}` },
        String(item.quantity),
        preciseCurrencyFormatter.format(item.unitPrice),
        item.taxRate > 0 ? `${Math.round(item.taxRate * 100)}%` : '—',
        preciseCurrencyFormatter.format(item.quantity * item.unitPrice),
    ]);

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
        body,
        styles: {
            all: { fontSize: 9.5, padding: { top: 8, right: 6, bottom: 8, left: 6 } },
            header: { fontSize: 8, characterSpacing: 0.4 } as never,
        },
        onCellBeforeDraw: ({ cell }) => {
            if (cell.section === 'body' && cell.columnIndex === 0 && cell.text.length > 1) {
                cell.style.textColor = inkColor;
            }
        },
    });

    let summaryY = table.finalY + 14;
    const summaryPadding = 10;
    const summaryBandLeft = right - 230;
    const summaryLeft = summaryBandLeft + summaryPadding;
    const amountRight = right - summaryPadding;

    const summaryRow = (label: string, amount: string, emphasis = false): void => {
        const fontSize = emphasis ? 11 : 9.5;
        const rowHeight = emphasis ? 26 : 16;
        const textY = summaryY + (rowHeight - doc.getLineHeight(fontSize)) / 2;

        doc.drawText(label, summaryLeft, textY, {
            fontSize,
            bold: emphasis,
            color: emphasis ? inkColor : mutedColor,
            maxWidth: 120,
            baseline: 'top',
        });
        doc.drawText(amount, amountRight - 100, textY, {
            fontSize,
            bold: emphasis,
            color: inkColor,
            align: 'right',
            maxWidth: 100,
            baseline: 'top',
        });

        summaryY += rowHeight;
    };

    summaryRow('Subtotal', preciseCurrencyFormatter.format(totals.subtotal));
    summaryRow('Tax', preciseCurrencyFormatter.format(totals.tax));

    doc.drawLine(summaryLeft, summaryY + 3, amountRight, summaryY + 3, { strokeColor: '#e5e7eb', lineWidth: 0.75 });
    summaryY += 9;

    doc.drawRectangle(summaryBandLeft, summaryY, right - summaryBandLeft, 26, {
        fillColor: '#eef2ff',
        radius: 5,
    });
    summaryRow('Total due', preciseCurrencyFormatter.format(totals.total), true);

    const footerY = doc.pageHeight - doc.margin.bottom - 46;
    doc.drawLine(left, footerY, right, footerY, { strokeColor: '#e5e7eb', lineWidth: 0.75 });
    doc.drawText(invoice.notes, left, footerY + 12, { fontSize: 9, color: mutedColor, maxWidth: 300 });
    doc.drawText(invoice.paymentTerms, right - 220, footerY + 12, {
        fontSize: 9,
        color: mutedColor,
        align: 'right',
        maxWidth: 220,
    });

    return doc;
}
