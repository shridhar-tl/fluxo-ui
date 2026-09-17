import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfDocument } from '../../../pdf';
import { PdfPreview } from './PdfPreview';

const code = `import { PdfDocument } from 'fluxo-ui/pdf';

const doc = new PdfDocument({ format: 'a4', margin: 40 });

doc.drawText('Typography', 40, 60, { fontSize: 22, bold: true });
doc.drawText('Helvetica, Times and Courier are always available.', 40, 88, {
  fontSize: 11,
  font: 'Times',
  italic: true,
  color: '#475569',
});

doc.drawText('Wrapped paragraph text flows inside a fixed measure.', 40, 120, {
  maxWidth: 240,
  lineHeightFactor: 1.4,
});

doc.drawText('Centred', 297, 200, { align: 'center', anchor: 'point', fontSize: 14 });
doc.drawText('Right edge', 555, 200, { align: 'right', anchor: 'point', fontSize: 14 });

doc.drawRectangle(40, 240, 140, 70, { fillColor: '#6366f1', radius: 10 });
doc.drawCircle(250, 275, 35, { fillColor: '#f97316', strokeColor: '#7c2d12', lineWidth: 2 });
doc.drawPolygon(
  [{ x: 330, y: 240 }, { x: 400, y: 310 }, { x: 330, y: 310 }],
  { fillColor: '#10b981', opacity: 0.75 },
);
doc.drawLine(40, 340, 555, 340, { strokeColor: '#cbd5e1', dashPattern: [5, 3] });

doc.drawPath((path) => {
  path.moveTo(40, 380).curveTo(140, 350, 240, 430, 340, 380);
}, { strokeColor: '#db2777', lineWidth: 2.5 });`;

const buildDocument = (): PdfDocument => {
    const doc = new PdfDocument({ format: 'a4', margin: 40, metadata: { title: 'Text and shapes' } });

    doc.drawText('Typography', 40, 60, { fontSize: 22, bold: true, color: '#0f172a' });
    doc.drawText('Helvetica, Times and Courier are always available.', 40, 88, {
        fontSize: 11,
        font: 'Times',
        italic: true,
        color: '#475569',
    });

    doc.drawText(
        'Wrapped paragraph text flows inside a fixed measure, breaking on word boundaries and honouring the line height factor you provide.',
        40,
        120,
        { maxWidth: 240, lineHeightFactor: 1.4, fontSize: 10 },
    );

    doc.drawText('Courier monospace 10pt', 320, 120, { font: 'Courier', fontSize: 10 });
    doc.drawText('Letter spaced heading', 320, 140, { fontSize: 10, characterSpacing: 1.6, color: '#64748b' });
    doc.drawText('Underlined', 320, 162, { fontSize: 10, underline: true });
    doc.drawText('Struck through', 320, 180, { fontSize: 10, strikeThrough: true, color: '#94a3b8' });

    doc.drawText('Centred', 297, 210, { align: 'center', anchor: 'point', fontSize: 14, bold: true });
    doc.drawText('Right edge', 555, 210, { align: 'right', anchor: 'point', fontSize: 14, bold: true });
    doc.drawText('Left edge', 40, 210, { fontSize: 14, bold: true });

    doc.drawRectangle(40, 250, 140, 70, { fillColor: '#6366f1', radius: 10 });
    doc.drawText('Rounded', 110, 280, { align: 'center', anchor: 'point', color: '#ffffff', bold: true });

    doc.drawCircle(250, 285, 35, { fillColor: '#f97316', strokeColor: '#7c2d12', lineWidth: 2 });
    doc.drawEllipse(360, 285, 48, 30, { fillColor: '#0ea5e9', opacity: 0.5 });

    doc.drawPolygon(
        [
            { x: 440, y: 250 },
            { x: 510, y: 320 },
            { x: 440, y: 320 },
        ],
        { fillColor: '#10b981', opacity: 0.8 },
    );

    doc.drawLine(40, 350, 555, 350, { strokeColor: '#cbd5e1', dashPattern: [5, 3], lineWidth: 1 });

    doc.drawPath(
        (path) => {
            path.moveTo(40, 400).curveTo(140, 365, 240, 450, 340, 400);
        },
        { strokeColor: '#db2777', lineWidth: 2.5 },
    );

    doc.drawText('Bezier path', 190, 420, { align: 'center', anchor: 'point', fontSize: 9, color: '#9d174d' });

    const swatches = ['#ef4444', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6'];
    swatches.forEach((color, index) => {
        doc.drawRectangle(40 + index * 44, 450, 36, 36, { fillColor: color, radius: 6 });
    });

    doc.drawText('Rotated 45°', 420, 430, { rotation: 45, fontSize: 12, color: '#475569' });

    return doc;
};

const TextAndShapesDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Text, Alignment and Vector Shapes"
            description="Fonts, wrapping, character spacing, decorations, alignment anchors, rounded rectangles, ellipses, polygons, dashed rules and bezier paths."
            centered={false}
        >
            <PdfPreview build={buildDocument} fileName="text-and-shapes.pdf" height={560} />
        </ComponentDemo>
        <CodeBlock code={code} language="tsx" />
    </>
);

export default TextAndShapesDemo;
