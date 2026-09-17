import React from 'react';
import { Button } from '../../../components/Button';
import { Dropdown } from '../../../components/Dropdown';
import { NumericInput } from '../../../components/NumericInput';
import { TextInput } from '../../../components/TextInput';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PdfDocument, drawGrid } from '../../../pdf';
import type { GridPresetName } from '../../../pdf';
import { PdfPreview } from './PdfPreview';
import { preciseCurrencyFormatter } from './pdf-story-data';

const code = `import { PdfDocument, drawGrid } from 'fluxo-ui/pdf';

const doc = new PdfDocument({ format, orientation, margin: 40 });

doc.drawText(title, 40, 50, { fontSize: 18, bold: true });

drawGrid(doc, {
  startY: 84,
  preset,          // lined | ruled | zebra | minimal | boxed
  columns: [
    { key: 'item', header: 'Item' },
    { key: 'qty', header: 'Qty', width: 56, style: { align: 'right' } },
    { key: 'rate', header: 'Rate', width: 80, style: { align: 'right' } },
    { key: 'amount', header: 'Amount', width: 90, style: { align: 'right' } },
  ],
  body: rows,
  foot: [[{ value: 'Total', colSpan: 3, style: { align: 'right' } }, total]],
});`;

interface DraftRow {
    id: number;
    item: string;
    quantity: number;
    rate: number;
}

const initialRows: DraftRow[] = [
    { id: 1, item: 'Discovery workshop', quantity: 2, rate: 1200 },
    { id: 2, item: 'Interface design', quantity: 6, rate: 950 },
    { id: 3, item: 'Front-end build', quantity: 10, rate: 880 },
];

const presetOptions: { label: string; value: GridPresetName }[] = [
    { label: 'Lined', value: 'lined' },
    { label: 'Ruled', value: 'ruled' },
    { label: 'Zebra', value: 'zebra' },
    { label: 'Minimal', value: 'minimal' },
    { label: 'Boxed', value: 'boxed' },
];

const formatOptions = [
    { label: 'A4', value: 'a4' },
    { label: 'Letter', value: 'letter' },
    { label: 'Legal', value: 'legal' },
    { label: 'A5', value: 'a5' },
];

const orientationOptions = [
    { label: 'Portrait', value: 'portrait' },
    { label: 'Landscape', value: 'landscape' },
];

let nextRowId = 4;

const fieldLabelClass = 'block text-[11px] font-semibold text-(--eui-text-muted) mb-1';

const InteractiveBuilderDemo: React.FC = () => {
    const [title, setTitle] = React.useState('Project Quotation');
    const [preset, setPreset] = React.useState<GridPresetName>('ruled');
    const [format, setFormat] = React.useState('a4');
    const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');
    const [rows, setRows] = React.useState<DraftRow[]>(initialRows);

    const updateRow = React.useCallback((id: number, patch: Partial<DraftRow>) => {
        setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    }, []);

    const addRow = React.useCallback(() => {
        setRows((current) => [...current, { id: nextRowId++, item: 'New line item', quantity: 1, rate: 500 }]);
    }, []);

    const removeRow = React.useCallback((id: number) => {
        setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
    }, []);

    const total = React.useMemo(() => rows.reduce((sum, row) => sum + row.quantity * row.rate, 0), [rows]);

    const build = React.useCallback(() => {
        const doc = new PdfDocument({
            format,
            orientation,
            margin: 40,
            metadata: { title },
        });

        doc.drawText(title || 'Untitled', 40, 50, { fontSize: 18, bold: true, color: '#0f172a' });
        doc.drawText('Generated from the form beside this preview', 40, 72, { fontSize: 9, color: '#64748b' });

        drawGrid(doc, {
            startY: 96,
            preset,
            columns: [
                { key: 'item', header: 'Item' },
                { key: 'qty', header: 'Qty', width: 52, style: { align: 'right' } },
                { key: 'rate', header: 'Rate', width: 78, style: { align: 'right' } },
                { key: 'amount', header: 'Amount', width: 88, style: { align: 'right' } },
            ],
            body: rows.map((row) => ({
                item: row.item,
                qty: String(row.quantity),
                rate: preciseCurrencyFormatter.format(row.rate),
                amount: preciseCurrencyFormatter.format(row.quantity * row.rate),
            })),
            foot: [
                [
                    { value: 'Total', colSpan: 3, style: { align: 'right' } },
                    preciseCurrencyFormatter.format(total),
                ],
            ],
            styles: { all: { fontSize: 9.5 } },
        });

        return doc;
    }, [format, orientation, preset, rows, title, total]);

    return (
        <>
            <ComponentDemo
                title="Build a Document from Form Input"
                description="Edit the title, page setup, table preset and line items. The preview regenerates from the same code a consumer would write."
                centered={false}
            >
                <div className="w-full flex flex-col gap-4">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                        <div>
                            <label className={fieldLabelClass} htmlFor="pdf-builder-title">
                                Document title
                            </label>
                            <TextInput
                                id="pdf-builder-title"
                                value={title}
                                onChange={({ value }) => setTitle(String(value ?? ''))}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Table preset</label>
                            <Dropdown
                                value={preset}
                                options={presetOptions}
                                onChange={({ value }) => setPreset(value as GridPresetName)}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Page size</label>
                            <Dropdown
                                value={format}
                                options={formatOptions}
                                onChange={({ value }) => setFormat(String(value))}
                            />
                        </div>
                        <div>
                            <label className={fieldLabelClass}>Orientation</label>
                            <Dropdown
                                value={orientation}
                                options={orientationOptions}
                                onChange={({ value }) => setOrientation(value as 'portrait' | 'landscape')}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {rows.map((row) => (
                            <div
                                key={row.id}
                                className="grid grid-cols-[minmax(140px,3fr)_90px_110px_auto] gap-2 items-center"
                            >
                                <TextInput
                                    value={row.item}
                                    aria-label="Line item description"
                                    onChange={({ value }) => updateRow(row.id, { item: String(value ?? '') })}
                                />
                                <NumericInput
                                    value={row.quantity}
                                    min={1}
                                    aria-label="Quantity"
                                    onChange={({ value }) => updateRow(row.id, { quantity: Number(value) || 1 })}
                                />
                                <NumericInput
                                    value={row.rate}
                                    min={0}
                                    aria-label="Rate"
                                    onChange={({ value }) => updateRow(row.id, { rate: Number(value) || 0 })}
                                />
                                <Button
                                    size="sm"
                                    layout="outlined"
                                    variant="danger"
                                    onClick={() => removeRow(row.id)}
                                    aria-label={`Remove ${row.item}`}
                                    disabled={rows.length === 1}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}

                        <div className="flex gap-2.5 items-center">
                            <Button size="sm" layout="outlined" onClick={addRow}>
                                Add line item
                            </Button>
                            <span className="text-xs text-(--eui-text-muted)">
                                Total {preciseCurrencyFormatter.format(total)}
                            </span>
                        </div>
                    </div>

                    <PdfPreview build={build} fileName="quotation.pdf" height={440} actionLabel="Refresh preview" />
                </div>
            </ComponentDemo>
            <CodeBlock code={code} language="tsx" />
        </>
    );
};

export default InteractiveBuilderDemo;
