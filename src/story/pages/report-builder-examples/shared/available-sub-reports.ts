import type { AvailableSubReport, ReportDefinition, SubReportDefinition } from '../../../../components/report-builder';

export const subReportsToAvailable = (subReports: SubReportDefinition[]): AvailableSubReport[] => {
    return subReports.map((sr) => ({
        id: sr.id,
        label: sr.label,
        parameters: (sr.definition.parameters ?? []).map((p) => ({
            name: p.name,
            label: p.label ?? p.name,
            type: mapParameterTypeToPropType(p.type),
        })),
    }));
};

const mapParameterTypeToPropType = (t: string): 'string' | 'number' | 'boolean' | 'any' => {
    if (t === 'numeric') return 'number';
    if (t === 'checkbox') return 'boolean';
    return 'string';
};

export const extractSubReportAvailable = (definition: ReportDefinition): AvailableSubReport => ({
    id: definition.id,
    label: definition.metadata.title || 'Untitled',
    parameters: (definition.parameters ?? []).map((p) => ({
        name: p.name,
        label: p.label ?? p.name,
        type: mapParameterTypeToPropType(p.type),
    })),
});
