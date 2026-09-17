import React from 'react';
import { Button } from '../../../components/Button';
import { FileUpload } from '../../../components/file-upload';
import { TextInput } from '../../../components/TextInput';
import { PdfDocument } from '../../../pdf';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfPreview } from './PdfPreview';

const code = `import { PdfDocument } from 'fluxo-ui/pdf';

const doc = new PdfDocument({ format: 'a4', orientation: 'landscape', margin: 0 });

const width = doc.pageWidth;
const centre = width / 2;

doc.drawRectangle(0, 0, width, doc.pageHeight, { fillColor: '#fffbeb' });
doc.drawRectangle(26, 26, width - 52, doc.pageHeight - 52, { strokeColor: '#b45309', lineWidth: 2.5 });

doc.drawText('CERTIFICATE OF COMPLETION', centre, 104, {
  align: 'center',
  anchor: 'point',
  fontSize: 25,
  bold: true,
  color: '#78350f',
  characterSpacing: 1.5,
});

doc.drawText(recipientName, centre, 200, {
  align: 'center',
  anchor: 'point',
  fontSize: 34,
  font: 'Times',
  italic: true,
});

// A seal supplied as a PNG or JPEG, sized and centred on the page
if (sealImage) {
  doc.drawImage(sealImage, { x: centre - 34, y: 318, width: 68, height: 68 });
} else {
  doc.drawCircle(centre, 352, 34, { fillColor: '#fef3c7', strokeColor: '#b45309', lineWidth: 1.5 });
  doc.drawText('SEAL', centre, 350, { align: 'center', anchor: 'point', fontSize: 10, bold: true });
}`;

const defaultName = 'Utilsware.com';

const fieldLabelClass = 'block text-[11px] font-semibold text-(--eui-text-muted) mb-1';

const defaultCitation =
    'has successfully completed the Advanced Interface Engineering programme, comprising 120 hours of instruction, assessed project work and a final practical examination.';

const buildCertificate = (recipientName: string, citation: string, seal: string | null): PdfDocument => {
    const doc = new PdfDocument({
        format: 'a4',
        orientation: 'landscape',
        margin: 0,
        metadata: { title: `Certificate — ${recipientName}`, subject: 'Certificate of completion' },
    });

    const width = doc.pageWidth;
    const height = doc.pageHeight;
    const centre = width / 2;

    doc.drawRectangle(0, 0, width, height, { fillColor: '#fffbeb' });
    doc.drawRectangle(26, 26, width - 52, height - 52, { strokeColor: '#b45309', lineWidth: 2.5 });
    doc.drawRectangle(34, 34, width - 68, height - 68, { strokeColor: '#d97706', lineWidth: 0.75 });

    const corner = (x: number, y: number, flipX: number, flipY: number): void => {
        doc.drawLine(x, y, x + 26 * flipX, y, { strokeColor: '#b45309', lineWidth: 2 });
        doc.drawLine(x, y, x, y + 26 * flipY, { strokeColor: '#b45309', lineWidth: 2 });
    };

    corner(48, 48, 1, 1);
    corner(width - 48, 48, -1, 1);
    corner(48, height - 48, 1, -1);
    corner(width - 48, height - 48, -1, -1);

    doc.drawText('CERTIFICATE OF COMPLETION', centre, 104, {
        align: 'center',
        anchor: 'point',
        fontSize: 25,
        bold: true,
        color: '#78350f',
        characterSpacing: 1.5,
    });

    doc.drawLine(centre - 120, 132, centre + 120, 132, { strokeColor: '#d97706', lineWidth: 1 });

    doc.drawText('This is to certify that', centre, 162, {
        align: 'center',
        anchor: 'point',
        fontSize: 12,
        color: '#57534e',
    });

    doc.drawText(recipientName || defaultName, centre - 280, 198, {
        align: 'center',
        maxWidth: 560,
        maxLines: 1,
        fontSize: 34,
        font: 'Times',
        italic: true,
        color: '#1c1917',
    });

    doc.drawLine(centre - 180, 248, centre + 180, 248, { strokeColor: '#d6d3d1', lineWidth: 0.75 });

    doc.drawText(citation || defaultCitation, centre - 250, 268, {
        align: 'center',
        maxWidth: 500,
        fontSize: 11,
        color: '#44403c',
        lineHeightFactor: 1.5,
    });

    if (seal) {
        doc.drawImage(seal, { x: centre - 34, y: 318, width: 68, height: 68, fit: 'contain' });
    } else {
        doc.drawCircle(centre, 352, 34, { fillColor: '#fef3c7', strokeColor: '#b45309', lineWidth: 1.5 });
        doc.drawText('SEAL', centre, 350, {
            align: 'center',
            anchor: 'point',
            fontSize: 10,
            bold: true,
            color: '#92400e',
            characterSpacing: 1,
        });
    }

    const signatureY = height - 96;

    doc.drawLine(120, signatureY, 300, signatureY, { strokeColor: '#78716c', lineWidth: 0.75 });
    doc.drawText('Programme Director', 210, signatureY + 10, {
        align: 'center',
        anchor: 'point',
        fontSize: 9,
        color: '#57534e',
    });

    doc.drawLine(width - 300, signatureY, width - 120, signatureY, { strokeColor: '#78716c', lineWidth: 0.75 });
    doc.drawText('Date of issue — 17 September 2026', width - 210, signatureY + 10, {
        align: 'center',
        anchor: 'point',
        fontSize: 9,
        color: '#57534e',
    });

    return doc;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('The image could not be read.'));
        reader.readAsDataURL(file);
    });

const CertificateDemo: React.FC = () => {
    const [recipientName, setRecipientName] = React.useState(defaultName);
    const [citation, setCitation] = React.useState(defaultCitation);
    const [seal, setSeal] = React.useState<string | null>(null);
    const [sealError, setSealError] = React.useState<string | null>(null);

    const handleSeal = React.useCallback((files: File[]) => {
        const file = files[0];
        if (!file) return;

        if (!/^image\/(png|jpeg)$/.test(file.type)) {
            setSealError('Choose a PNG or JPEG image for the seal.');
            return;
        }

        readFileAsDataUrl(file)
            .then((dataUrl) => {
                setSeal(dataUrl);
                setSealError(null);
            })
            .catch((error: Error) => setSealError(error.message));
    }, []);

    const clearSeal = React.useCallback(() => {
        setSeal(null);
        setSealError(null);
    }, []);

    const build = React.useCallback(() => buildCertificate(recipientName, citation, seal), [citation, recipientName, seal]);

    return (
        <>
            <ComponentDemo
                title="Certificate"
                description="A landscape page with zero margins, decorative borders and corner rules. Type a recipient name and upload a seal image to see both placed in the document."
                centered={false}
            >
                <div className="w-full flex flex-col gap-4">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                        <div>
                            <label className={fieldLabelClass} htmlFor="certificate-recipient">
                                Recipient name
                            </label>
                            <TextInput
                                id="certificate-recipient"
                                value={recipientName}
                                placeholder={defaultName}
                                onChange={({ value }) => setRecipientName(String(value ?? ''))}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass} htmlFor="certificate-citation">
                                Citation
                            </label>
                            <TextInput
                                id="certificate-citation"
                                value={citation}
                                onChange={({ value }) => setCitation(String(value ?? ''))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={fieldLabelClass}>Seal image (PNG or JPEG)</label>
                        <FileUpload accept="image/png,image/jpeg" maxFiles={1} showPreview={false} onFilesSelect={handleSeal} />
                        <div className="flex gap-2.5 items-center mt-2">
                            <span className="text-xs text-(--eui-text-muted)">
                                {seal ? 'Seal image loaded.' : 'No seal chosen — a drawn placeholder is used.'}
                            </span>
                            {seal && (
                                <Button size="sm" layout="outlined" onClick={clearSeal}>
                                    Remove seal
                                </Button>
                            )}
                        </div>
                        {sealError && (
                            <div role="alert" className="mt-2 text-xs text-red-600">
                                {sealError}
                            </div>
                        )}
                    </div>

                    <PdfPreview build={build} fileName="certificate.pdf" height={460} actionLabel="Refresh certificate" />
                </div>
            </ComponentDemo>
            <CodeBlock code={code} language="tsx" />
        </>
    );
};

export default CertificateDemo;
