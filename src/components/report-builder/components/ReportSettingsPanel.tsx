import React, { useCallback } from 'react';
import { Dropdown } from '../../Dropdown';
import { NumericInput } from '../../NumericInput';
import { TextInput } from '../../TextInput';
import { TextArea } from '../../TextArea';
import type { ListItem } from '../../../types';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import type { ReportMetadata, PageSetup, PageSize, PageOrientation } from '../report-definition-types';

const pageSizeOptions: ListItem[] = [
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'A5', label: 'A5 (148 × 210 mm)' },
    { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
    { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
    { value: 'custom', label: 'Custom' },
];

const orientationOptions: ListItem[] = [
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
];

export const ReportSettingsPanel: React.FC = () => {
    const { store } = useReportBuilderContext();
    const metadata = useRBStore((s) => s.definition.metadata);
    const reportId = useRBStore((s) => s.definition.id);
    const pageSetup = useRBStore((s) => s.definition.globalStyles.pageSetup);

    const update = useCallback(
        (patch: Partial<ReportMetadata>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    metadata: {
                        ...prev.definition.metadata,
                        ...patch,
                        updatedAt: new Date().toISOString(),
                    },
                },
            }));
        },
        [store],
    );

    const updatePageSetup = useCallback(
        (patch: Partial<PageSetup>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    globalStyles: {
                        ...prev.definition.globalStyles,
                        pageSetup: {
                            size: 'A4' as PageSize,
                            orientation: 'portrait' as PageOrientation,
                            ...prev.definition.globalStyles.pageSetup,
                            ...patch,
                        },
                    },
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            }));
        },
        [store],
    );

    return (
        <div className="eui-rb-report-settings">
            <div className="eui-rb-report-settings-section">
                <div className="eui-rb-report-settings-section-title">Metadata</div>

                <div className="eui-rb-report-settings-field">
                    <label htmlFor="rb-settings-title">Title</label>
                    <TextInput
                        id="rb-settings-title"
                        value={metadata.title}
                        onChange={(e) => update({ title: e.target.value })}
                        placeholder="Report title"
                    />
                </div>

                <div className="eui-rb-report-settings-field">
                    <label htmlFor="rb-settings-desc">Description</label>
                    <TextArea
                        id="rb-settings-desc"
                        value={metadata.description ?? ''}
                        onChange={(e) => update({ description: e.target.value })}
                        placeholder="Optional description"
                        rows={3}
                    />
                </div>

                <div className="eui-rb-report-settings-field">
                    <label htmlFor="rb-settings-version">Version</label>
                    <TextInput
                        id="rb-settings-version"
                        value={metadata.version}
                        onChange={(e) => update({ version: e.target.value })}
                        placeholder="1.0.0"
                    />
                </div>
            </div>

            <div className="eui-rb-report-settings-section">
                <div className="eui-rb-report-settings-section-title">Page Setup</div>

                <div className="eui-rb-report-settings-field">
                    <label>Page Size</label>
                    <Dropdown
                        options={pageSizeOptions}
                        value={pageSetup?.size ?? 'A4'}
                        onChange={(e) => updatePageSetup({ size: e.value as PageSize })}
                        aria-label="Page size"
                        size="sm"
                    />
                </div>

                <div className="eui-rb-report-settings-field">
                    <label>Orientation</label>
                    <Dropdown
                        options={orientationOptions}
                        value={pageSetup?.orientation ?? 'portrait'}
                        onChange={(e) => updatePageSetup({ orientation: e.value as PageOrientation })}
                        aria-label="Page orientation"
                        size="sm"
                    />
                </div>

                {pageSetup?.size === 'custom' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div className="eui-rb-report-settings-field">
                            <label>Width (mm)</label>
                            <NumericInput
                                value={pageSetup?.customWidth ?? 210}
                                onChange={(e) => updatePageSetup({ customWidth: e.value ?? 210 })}
                                min={50}
                                max={1000}
                                aria-label="Custom page width"
                                size="sm"
                            />
                        </div>
                        <div className="eui-rb-report-settings-field">
                            <label>Height (mm)</label>
                            <NumericInput
                                value={pageSetup?.customHeight ?? 297}
                                onChange={(e) => updatePageSetup({ customHeight: e.value ?? 297 })}
                                min={50}
                                max={1500}
                                aria-label="Custom page height"
                                size="sm"
                            />
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                    <div className="eui-rb-report-settings-field">
                        <label>Margin Top (mm)</label>
                        <NumericInput
                            value={pageSetup?.marginTop ?? 10}
                            onChange={(e) => updatePageSetup({ marginTop: e.value ?? 0 })}
                            min={0}
                            max={100}
                            aria-label="Top margin"
                            size="sm"
                        />
                    </div>
                    <div className="eui-rb-report-settings-field">
                        <label>Margin Bottom (mm)</label>
                        <NumericInput
                            value={pageSetup?.marginBottom ?? 10}
                            onChange={(e) => updatePageSetup({ marginBottom: e.value ?? 0 })}
                            min={0}
                            max={100}
                            aria-label="Bottom margin"
                            size="sm"
                        />
                    </div>
                    <div className="eui-rb-report-settings-field">
                        <label>Margin Left (mm)</label>
                        <NumericInput
                            value={pageSetup?.marginLeft ?? 10}
                            onChange={(e) => updatePageSetup({ marginLeft: e.value ?? 0 })}
                            min={0}
                            max={100}
                            aria-label="Left margin"
                            size="sm"
                        />
                    </div>
                    <div className="eui-rb-report-settings-field">
                        <label>Margin Right (mm)</label>
                        <NumericInput
                            value={pageSetup?.marginRight ?? 10}
                            onChange={(e) => updatePageSetup({ marginRight: e.value ?? 0 })}
                            min={0}
                            max={100}
                            aria-label="Right margin"
                            size="sm"
                        />
                    </div>
                </div>
            </div>

            <div className="eui-rb-report-settings-section">
                <div className="eui-rb-report-settings-section-title">Info</div>
                <div style={{ fontSize: 11, color: 'var(--eui-text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>Created: {new Date(metadata.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(metadata.updatedAt).toLocaleString()}</div>
                    <div>ID: <span style={{ fontFamily: 'monospace' }}>{reportId}</span></div>
                </div>
            </div>
        </div>
    );
};
