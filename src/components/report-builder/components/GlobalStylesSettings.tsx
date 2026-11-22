import React, { useCallback, useState } from 'react';
import { Dropdown } from '../../Dropdown';
import { NumericInput } from '../../NumericInput';
import { TextInput } from '../../TextInput';
import type { ListItem } from '../../../types';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { GlobalStyles, HeadingStyle, TableStyle } from '../report-definition-types';
import { ColorInput } from './props/ColorInput';

type HeadingLevel = keyof GlobalStyles['headings'];

const headingLevels: ListItem[] = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((level) => ({ value: level, label: `Heading ${level.slice(1)}` }));

const headingWeightOptions: ListItem[] = [
    { value: '', label: 'Default (bold)' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi-bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra bold' },
];

const tableColorFields: Array<{ key: Exclude<keyof TableStyle, 'cellBorder'>; label: string }> = [
    { key: 'headerBackground', label: 'Header background' },
    { key: 'headerColor', label: 'Header text' },
    { key: 'bodyColor', label: 'Body text' },
    { key: 'alternateRowColor', label: 'Alternate rows' },
    { key: 'footerBackground', label: 'Footer background' },
    { key: 'footerColor', label: 'Footer text' },
];

const Field: React.FC<{ label: string; htmlFor?: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
    <div className="eui-rb-report-settings-field">
        <label htmlFor={htmlFor}>{label}</label>
        {children}
    </div>
);

export const GlobalStylesSettings: React.FC = () => {
    const { store } = useReportBuilderContext();
    const globalStyles = useRBStore((s) => s.definition.globalStyles);
    const [level, setLevel] = useState<HeadingLevel>('h1');
    const heading = globalStyles.headings?.[level] ?? {};
    const table = globalStyles.table ?? {};

    const updateStyles = useCallback(
        (change: (styles: GlobalStyles) => GlobalStyles) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    globalStyles: change(prev.definition.globalStyles),
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            }));
        },
        [store],
    );

    const updateBase = useCallback(
        (patch: Partial<Pick<GlobalStyles, 'fontFamily' | 'fontSize' | 'textColor'>>) => updateStyles((styles) => ({ ...styles, ...patch })),
        [updateStyles],
    );

    const updateHeading = useCallback(
        (patch: Partial<HeadingStyle>) =>
            updateStyles((styles) => ({
                ...styles,
                headings: { ...styles.headings, [level]: { ...styles.headings?.[level], ...patch } },
            })),
        [updateStyles, level],
    );

    const updateTable = useCallback(
        (patch: Partial<TableStyle>) => updateStyles((styles) => ({ ...styles, table: { ...styles.table, ...patch } })),
        [updateStyles],
    );

    return (
        <div className="eui-rb-report-settings-section">
            <div className="eui-rb-report-settings-section-title">Global Styles</div>
            <div className="eui-rb-prop-hint">
                The look of the whole report. A component's own styles take precedence over these.
            </div>

            <Field label="Font family" htmlFor="rb-settings-font-family">
                <TextInput
                    id="rb-settings-font-family"
                    value={globalStyles.fontFamily ?? ''}
                    onChange={(e) => updateBase({ fontFamily: e.value || undefined })}
                    placeholder="Inherited, for example Georgia, serif"
                    size="sm"
                />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <Field label="Font size (px)">
                    <NumericInput
                        value={globalStyles.fontSize ?? undefined}
                        onChange={(e) => updateBase({ fontSize: e.value || undefined })}
                        min={8}
                        max={48}
                        placeholder="13"
                        aria-label="Report font size"
                        size="sm"
                    />
                </Field>
                <Field label="Text color">
                    <ColorInput value={globalStyles.textColor} onChange={(textColor) => updateBase({ textColor })} aria-label="Report text color" />
                </Field>
            </div>

            <div className="eui-rb-report-settings-subtitle">Headings</div>
            <Field label="Heading level">
                <Dropdown options={headingLevels} value={level} onChange={(e) => setLevel(e.value as HeadingLevel)} ariaLabel="Heading level" size="sm" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <Field label="Size (px)">
                    <NumericInput
                        value={heading.fontSize ?? undefined}
                        onChange={(e) => updateHeading({ fontSize: e.value || undefined })}
                        min={8}
                        max={96}
                        placeholder="Default"
                        aria-label="Heading font size"
                        size="sm"
                    />
                </Field>
                <Field label="Weight">
                    <Dropdown
                        options={headingWeightOptions}
                        value={heading.fontWeight ?? ''}
                        onChange={(e) => updateHeading({ fontWeight: e.value || undefined })}
                        ariaLabel="Heading font weight"
                        size="sm"
                    />
                </Field>
            </div>
            <Field label="Color">
                <ColorInput value={heading.color} onChange={(color) => updateHeading({ color })} aria-label="Heading color" />
            </Field>
            <Field label="Font family" htmlFor="rb-settings-heading-font">
                <TextInput
                    id="rb-settings-heading-font"
                    value={heading.fontFamily ?? ''}
                    onChange={(e) => updateHeading({ fontFamily: e.value || undefined })}
                    placeholder="Same as the report"
                    size="sm"
                />
            </Field>

            <div className="eui-rb-report-settings-subtitle">Tables</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {tableColorFields.map(({ key, label }) => (
                    <Field key={key} label={label}>
                        <ColorInput value={table[key]} onChange={(color) => updateTable({ [key]: color })} aria-label={`Table ${label.toLowerCase()}`} placeholder="Default" />
                    </Field>
                ))}
            </div>
            <Field label="Cell border" htmlFor="rb-settings-cell-border">
                <TextInput
                    id="rb-settings-cell-border"
                    value={table.cellBorder ?? ''}
                    onChange={(e) => updateTable({ cellBorder: e.value || undefined })}
                    placeholder="1px solid #e5e7eb"
                    size="sm"
                />
            </Field>
        </div>
    );
};
