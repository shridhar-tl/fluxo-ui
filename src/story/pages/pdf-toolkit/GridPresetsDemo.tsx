import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfDocument, drawGrid, listGridPresets } from '../../../pdf';
import type { GridPresetName } from '../../../pdf';
import { PdfPreview } from './PdfPreview';
import { catalogEntries, currencyFormatter } from './pdf-story-data';

const code = `import { PdfDocument, drawGrid } from 'fluxo-ui/pdf';

const doc = new PdfDocument({ format: 'a4' });

// Five built-in presets: lined, ruled, zebra, minimal, boxed
let y = 60;
for (const preset of ['lined', 'ruled', 'zebra', 'minimal', 'boxed'] as const) {
  const result = drawGrid(doc, {
    startY: y,
    preset,
    columns: [
      { key: 'sku', header: 'SKU', width: 70 },
      { key: 'product', header: 'Product' },
      { key: 'stock', header: 'Stock', width: 54, style: { align: 'right' } },
      { key: 'price', header: 'Price', width: 62, style: { align: 'right' } },
    ],
    body: rows,
  });
  y = result.finalY + 26;
}`;

const buildDocument = (): PdfDocument => {
    const doc = new PdfDocument({ format: 'a4', margin: 40, metadata: { title: 'Grid presets' } });
    const presets = listGridPresets();

    const rows = catalogEntries.slice(0, 4).map((entry) => ({
        sku: entry.sku,
        product: entry.product,
        stock: String(entry.stock),
        price: currencyFormatter.format(entry.price),
    }));

    let cursor = 54;

    presets.forEach((preset: GridPresetName) => {
        doc.drawText(preset, 40, cursor, { fontSize: 11, bold: true, color: '#334155' });
        cursor += 18;

        const result = drawGrid(doc, {
            startY: cursor,
            preset,
            columns: [
                { key: 'sku', header: 'SKU', width: 70 },
                { key: 'product', header: 'Product' },
                { key: 'stock', header: 'Stock', width: 54, style: { align: 'right' } },
                { key: 'price', header: 'Price', width: 66, style: { align: 'right' } },
            ],
            body: rows,
            styles: { all: { fontSize: 9 } },
        });

        cursor = result.finalY + 26;
    });

    return doc;
};

const GridPresetsDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Table Presets"
            description="Every built-in table preset rendered from the same data: lined, ruled, zebra, minimal and boxed."
            centered={false}
        >
            <PdfPreview build={buildDocument} fileName="grid-presets.pdf" height={620} />
        </ComponentDemo>
        <CodeBlock code={code} language="tsx" />
    </>
);

export default GridPresetsDemo;
