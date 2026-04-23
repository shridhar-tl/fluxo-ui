import { create } from '../../../../store';
import type { ReportDefinition, SubReportDefinition } from '../../../../components/report-builder';
import { buildMainSalesReport } from './seed-main-report';
import { buildOrderDetailsSubReport, buildRegionSummarySubReport, buildSalesRepSubReport } from './seed-sub-reports';

export interface ReportExamplesState {
    mainReport: ReportDefinition;
    subReports: Record<string, SubReportDefinition>;
}

const initialState = (): ReportExamplesState => ({
    mainReport: buildMainSalesReport(),
    subReports: {
        'sr-order-details': {
            id: 'sr-order-details',
            label: 'Order Details',
            definition: buildOrderDetailsSubReport(),
        },
        'sr-region-summary': {
            id: 'sr-region-summary',
            label: 'Region Summary',
            definition: buildRegionSummarySubReport(),
        },
        'sr-sales-rep': {
            id: 'sr-sales-rep',
            label: 'Sales Rep Performance',
            definition: buildSalesRepSubReport(),
        },
    },
});

export const reportExamplesStore = create<ReportExamplesState>(() => initialState());

export const updateMainReport = (definition: ReportDefinition): void => {
    reportExamplesStore.setState((prev) => ({ ...prev, mainReport: definition }));
};

export const updateSubReport = (id: string, definition: ReportDefinition): void => {
    reportExamplesStore.setState((prev) => {
        const existing = prev.subReports[id];
        if (!existing) return prev;
        return {
            ...prev,
            subReports: {
                ...prev.subReports,
                [id]: { ...existing, definition },
            },
        };
    });
};

export const resetReportExamples = (): void => {
    reportExamplesStore.setState(initialState(), true);
};

export const getSubReportList = (state: ReportExamplesState): SubReportDefinition[] => {
    return Object.values(state.subReports);
};
