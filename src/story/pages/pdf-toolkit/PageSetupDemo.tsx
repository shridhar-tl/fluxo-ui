import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfDocument, applyWatermark } from '../../../pdf';
import { PdfPreview } from './PdfPreview';

const code = `import { PdfDocument, applyWatermark } from 'fluxo-ui/pdf';

// Work in millimetres instead of points
const doc = new PdfDocument({ unit: 'mm', format: 'a5', margin: 12 });

doc.drawText('A5 measured in millimetres', 12, 20, { fontSize: 14, bold: true });
doc.drawRectangle(12, 30, 60, 25, { fillColor: '#0ea5e9' });

// Each page can take its own size and orientation
doc.addPage({ format: 'letter', orientation: 'landscape' });
doc.drawText('Letter, landscape', 12, 20, { fontSize: 14, bold: true });

doc.addPage({ format: [120, 80] });
doc.drawText('Custom 120 x 80 mm', 12, 20, { fontSize: 12, bold: true });

applyWatermark(doc, { text: 'SPECIMEN', opacity: 0.12 });`;

const buildDocument = (): PdfDocument => {
    const doc = new PdfDocument({
        unit: 'mm',
        format: 'a5',
        margin: 12,
        metadata: { title: 'Page setup' },
    });

    const describe = (title: string, detail: string): void => {
        doc.drawText(title, 12, 18, { fontSize: 13, bold: true, color: '#0f172a' });
        doc.drawText(detail, 12, 28, { fontSize: 8.5, color: '#64748b' });
        doc.drawText(
            `${doc.pageWidth.toFixed(1)} × ${doc.pageHeight.toFixed(1)} mm`,
            12,
            36,
            { fontSize: 8.5, color: '#94a3b8' },
        );
    };

    describe('A5 portrait', 'Millimetre units, 12 mm margin on every side');
    doc.drawRectangle(12, 46, 50, 20, { fillColor: '#0ea5e9', radius: 2 });
    doc.drawText('50 × 20 mm', 37, 56, { align: 'center', anchor: 'point', color: '#ffffff', fontSize: 8, bold: true });

    const ruler = (): void => {
        for (let mark = 0; mark <= 100; mark += 10) {
            const x = 12 + mark;
            if (x > doc.pageWidth - 12) break;
            doc.drawLine(x, 80, x, mark % 50 === 0 ? 86 : 83, { strokeColor: '#475569', lineWidth: 0.3 });
            if (mark % 50 === 0) {
                doc.drawText(`${mark}`, x, 88, { align: 'center', anchor: 'point', fontSize: 6, color: '#475569' });
            }
        }
        doc.drawLine(12, 80, Math.min(112, doc.pageWidth - 12), 80, { strokeColor: '#475569', lineWidth: 0.3 });
    };
    ruler();

    doc.addPage({ format: 'letter', orientation: 'landscape' });
    describe('Letter landscape', 'A different size and orientation on the very next page');
    doc.drawCircle(60, 60, 14, { fillColor: '#f59e0b' });
    doc.drawCircle(95, 60, 14, { fillColor: '#8b5cf6' });
    doc.drawCircle(130, 60, 14, { fillColor: '#10b981' });

    doc.addPage({ format: [120, 80] });
    describe('Custom 120 × 80', 'Any width and height, expressed in the document unit');
    doc.drawRectangle(12, 46, 96, 22, { strokeColor: '#334155', lineWidth: 0.4, dashPattern: [2, 1.5] });

    doc.addPage({ format: 'a5', margin: 4 });
    describe('Tight margin', 'Margins can also change per page');
    doc.drawRectangle(4, 44, doc.pageWidth - 8, 30, { fillColor: '#f1f5f9', radius: 2 });

    applyWatermark(doc, { text: 'SPECIMEN', opacity: 0.1, fontSize: 40 });

    return doc;
};

const PageSetupDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Units, Page Sizes and Watermarks"
            description="A document measured in millimetres where each page chooses its own size, orientation and margin, finished with a watermark applied across every page."
            centered={false}
        >
            <PdfPreview build={buildDocument} fileName="page-setup.pdf" height={520} />
        </ComponentDemo>
        <CodeBlock code={code} language="tsx" />
    </>
);

export default PageSetupDemo;
