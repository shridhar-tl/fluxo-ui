import cn from 'classnames';
import React from 'react';
import { Button } from '../../../components/Button';
import { Checkbox } from '../../../components/Checkbox';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { savePdf } from '../../../pdf';
import { buildPdfFromTable } from '../../../pdf/html';
import { catalogEntries, currencyFormatter } from './pdf-story-data';

const code = `import { buildPdfFromTable, exportTableToPdf } from 'fluxo-ui/pdf/html';

// One call: read a live table from the DOM and save it
exportTableToPdf('#catalog-table', {
  title: 'Product Catalog',
  fileName: 'catalog.pdf',
  // Keep the spacing, alignment and borders, but print in the preset's colours
  extract: { inheritStyles: true, ignoreColors: true },
  grid: { preset: 'ruled' },
});

// Or take the document first to keep editing it
const { doc } = buildPdfFromTable('#catalog-table', {
  extract: { inheritStyles: true, includeHidden: false },
  grid: { preset: 'zebra' },
});
doc.drawText('Reviewed by operations', 40, doc.pageHeight - 60, { fontSize: 9 });
savePdf(doc.build(), 'catalog.pdf');`;

const tableId = 'fluxo-pdf-catalog-table';

const bodyCellClass = 'px-2.5 py-2 text-[13px] text-(--eui-text) border-b border-(--eui-border)';
const headCellClass =
    'px-2.5 py-2 text-[13px] text-left font-semibold text-(--eui-text) bg-(--eui-bg-subtle) border-b-2 border-(--eui-border)';

const HtmlTableDemo: React.FC = () => {
    const [inheritStyles, setInheritStyles] = React.useState(true);
    const [ignoreColors, setIgnoreColors] = React.useState(true);
    const [preset, setPreset] = React.useState<'ruled' | 'zebra'>('ruled');

    const exportTable = React.useCallback(() => {
        const { doc } = buildPdfFromTable(`#${tableId}`, {
            title: 'Product Catalog',
            extract: { inheritStyles, ignoreColors },
            grid: { preset, startY: 44 },
        });
        savePdf(doc.build(), 'catalog.pdf');
    }, [ignoreColors, inheritStyles, preset]);

    return (
        <>
            <ComponentDemo
                title="Export an HTML Table"
                description="Reads a table that is already on the page — text, colspans and optionally the computed CSS — and turns it into a PDF."
                centered={false}
            >
                <div className="w-full flex flex-col gap-3.5">
                    <div className="overflow-x-auto">
                        <table id={tableId} className="w-full border-collapse min-w-115">
                            <thead>
                                <tr>
                                    <th className={headCellClass}>SKU</th>
                                    <th className={headCellClass}>Product</th>
                                    <th className={headCellClass}>Category</th>
                                    <th className={cn(headCellClass, 'text-right')}>Stock</th>
                                    <th className={cn(headCellClass, 'text-right')}>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {catalogEntries.map((entry) => (
                                    <tr key={entry.sku}>
                                        <td className={bodyCellClass}>{entry.sku}</td>
                                        <td className={bodyCellClass}>{entry.product}</td>
                                        <td className={bodyCellClass}>{entry.category}</td>
                                        <td
                                            className={cn(bodyCellClass, 'text-right', {
                                                'text-red-600': entry.stock === 0,
                                            })}
                                        >
                                            {entry.stock === 0 ? 'Out of stock' : entry.stock}
                                        </td>
                                        <td className={cn(bodyCellClass, 'text-right')}>
                                            {currencyFormatter.format(entry.price)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className={cn(bodyCellClass, 'text-right font-semibold')}>
                                        Catalog total
                                    </td>
                                    <td className={cn(bodyCellClass, 'text-right font-semibold')}>
                                        {catalogEntries.reduce((sum, entry) => sum + entry.stock, 0)}
                                    </td>
                                    <td className={cn(bodyCellClass, 'text-right font-semibold')}>
                                        {currencyFormatter.format(
                                            catalogEntries.reduce((sum, entry) => sum + entry.price, 0),
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex flex-wrap gap-3.5 items-center">
                        <Checkbox
                            checked={inheritStyles}
                            onChange={({ value }) => setInheritStyles(value)}
                            label="Carry over the table's CSS"
                        />
                        <Checkbox
                            checked={ignoreColors}
                            disabled={!inheritStyles}
                            onChange={({ value }) => setIgnoreColors(value)}
                            label="Leave the page colours behind"
                        />
                        <Checkbox
                            checked={preset === 'zebra'}
                            onChange={({ value }) => setPreset(value ? 'zebra' : 'ruled')}
                            label="Use the zebra preset"
                        />
                        <Button size="sm" variant="primary" onClick={exportTable}>
                            Export this table
                        </Button>
                    </div>
                </div>
            </ComponentDemo>
            <CodeBlock code={code} language="tsx" />
        </>
    );
};

export default HtmlTableDemo;
