import type { ReportDefinition, DatasourcePlugin } from '../../../components/report-builder';
import { createEmptyDefinition } from '../../../components/report-builder';
import { staticJsonPlugin } from './plugins/static-json-plugin';
import { httpPlugin } from './plugins/http-plugin';
import { jiraPlugin } from './plugins/jira-plugin';
import { csvPlugin } from './plugins/csv-plugin';

export const salesData = [
    { region: 'North', product: 'Widget A', revenue: 12500, units: 150, quarter: 'Q1' },
    { region: 'North', product: 'Widget B', revenue: 8200, units: 90, quarter: 'Q1' },
    { region: 'North', product: 'Widget A', revenue: 14100, units: 170, quarter: 'Q2' },
    { region: 'North', product: 'Widget B', revenue: 9500, units: 105, quarter: 'Q2' },
    { region: 'South', product: 'Widget A', revenue: 15800, units: 200, quarter: 'Q1' },
    { region: 'South', product: 'Widget B', revenue: 6400, units: 75, quarter: 'Q1' },
    { region: 'South', product: 'Widget A', revenue: 16200, units: 210, quarter: 'Q2' },
    { region: 'South', product: 'Widget B', revenue: 7800, units: 88, quarter: 'Q2' },
    { region: 'East', product: 'Widget A', revenue: 11000, units: 130, quarter: 'Q1' },
    { region: 'East', product: 'Widget B', revenue: 9700, units: 110, quarter: 'Q1' },
    { region: 'East', product: 'Widget A', revenue: 12400, units: 145, quarter: 'Q2' },
    { region: 'East', product: 'Widget B', revenue: 10200, units: 118, quarter: 'Q2' },
    { region: 'West', product: 'Widget A', revenue: 14200, units: 180, quarter: 'Q1' },
    { region: 'West', product: 'Widget B', revenue: 7100, units: 85, quarter: 'Q1' },
    { region: 'West', product: 'Widget A', revenue: 15600, units: 195, quarter: 'Q2' },
    { region: 'West', product: 'Widget B', revenue: 8400, units: 96, quarter: 'Q2' },
];

export const regionSummary = [
    { region: 'North', totalRevenue: 44300 },
    { region: 'South', totalRevenue: 46200 },
    { region: 'East', totalRevenue: 43300 },
    { region: 'West', totalRevenue: 45300 },
];

export const productSummary = [
    { product: 'Widget A', totalRevenue: 111800 },
    { product: 'Widget B', totalRevenue: 67300 },
];

export const quarterlySummary = [
    { quarter: 'Q1', revenue: 84900 },
    { quarter: 'Q2', revenue: 94200 },
];

export const sampleDatasourcePlugins: DatasourcePlugin[] = [
    staticJsonPlugin,
    httpPlugin,
    jiraPlugin,
    csvPlugin,
];

export const sampleReportDefinition: ReportDefinition = {
    ...createEmptyDefinition('Quarterly Sales Report'),
    globalStyles: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headings: {},
        table: {
            headerBackground: 'var(--eui-bg-subtle)',
            headerColor: 'var(--eui-text)',
            alternateRowColor: 'var(--eui-hover)',
            cellBorder: '1px solid var(--eui-border-subtle)',
        },
        pageSetup: {
            size: 'A4',
            orientation: 'portrait',
            marginTop: 10,
            marginRight: 10,
            marginBottom: 10,
            marginLeft: 10,
        },
    },
    datasources: [
        { id: 'ds-sales', name: 'sales', type: 'static-json', config: { json: JSON.stringify(salesData) } },
        { id: 'ds-region', name: 'regionSummary', type: 'static-json', config: { json: JSON.stringify(regionSummary) } },
        { id: 'ds-product', name: 'productSummary', type: 'static-json', config: { json: JSON.stringify(productSummary) } },
        { id: 'ds-quarterly', name: 'quarterlySummary', type: 'static-json', config: { json: JSON.stringify(quarterlySummary) } },
    ],
    components: [
        {
            id: 'hdr-main',
            type: 'header',
            props: { level: 'h1', content: 'Quarterly Sales Report' },
            styles: { marginBottom: 2 },
        },
        {
            id: 'txt-subtitle',
            type: 'text',
            props: { content: 'FY 2025 — Regional sales performance across product lines and quarters.' },
            styles: { textColor: 'var(--eui-text-muted)', marginBottom: 8 },
        },
        {
            id: 'hr-top',
            type: 'horizontal-line',
            props: { thickness: 2, color: 'var(--eui-primary)', marginTop: 0, marginBottom: 16 },
            styles: {},
        },
        {
            id: 'hdr-overview',
            type: 'header',
            props: { level: 'h3', content: 'Revenue Overview' },
            styles: { marginBottom: 8 },
        },
        {
            id: 'cols-charts-row1',
            type: 'columns',
            props: { columnCount: 2 },
            styles: { marginBottom: 12 },
            children: [
                {
                    id: 'col-bar',
                    type: 'column',
                    props: {},
                    styles: {},
                    children: [
                        {
                            id: 'chart-bar',
                            type: 'chart-bar',
                            props: {
                                datasourceId: 'ds-region',
                                title: 'Revenue by Region',
                                xAxisField: 'region',
                                yAxisField: 'totalRevenue',
                                barColor: '#4f87f7',
                                showLegend: false,
                            },
                            styles: {},
                        },
                    ],
                },
                {
                    id: 'col-line',
                    type: 'column',
                    props: {},
                    styles: {},
                    children: [
                        {
                            id: 'chart-line',
                            type: 'chart-line',
                            props: {
                                datasourceId: 'ds-quarterly',
                                title: 'Quarterly Trend',
                                xAxisField: 'quarter',
                                yAxisField: 'revenue',
                                lineColor: '#48c774',
                                lineTension: 0.3,
                                showPoints: true,
                                areaFill: true,
                                showLegend: false,
                            },
                            styles: {},
                        },
                    ],
                },
            ],
        },
        {
            id: 'cols-charts-row2',
            type: 'columns',
            props: { columnCount: 2 },
            styles: { marginBottom: 16 },
            children: [
                {
                    id: 'col-donut',
                    type: 'column',
                    props: {},
                    styles: {},
                    children: [
                        {
                            id: 'chart-donut',
                            type: 'chart-donut',
                            props: {
                                datasourceId: 'ds-product',
                                title: 'Revenue by Product',
                                labelField: 'product',
                                valueField: 'totalRevenue',
                                colors: ['#4f87f7', '#f76f6f'],
                                showLegend: true,
                            },
                            styles: {},
                        },
                    ],
                },
                {
                    id: 'col-pie',
                    type: 'column',
                    props: {},
                    styles: {},
                    children: [
                        {
                            id: 'chart-pie',
                            type: 'chart-pie',
                            props: {
                                datasourceId: 'ds-region',
                                title: 'Regional Distribution',
                                labelField: 'region',
                                valueField: 'totalRevenue',
                                showLegend: true,
                            },
                            styles: {},
                        },
                    ],
                },
            ],
        },
        {
            id: 'hr-mid',
            type: 'horizontal-line',
            props: { thickness: 1, marginTop: 8, marginBottom: 12 },
            styles: {},
        },
        {
            id: 'hdr-detail',
            type: 'header',
            props: { level: 'h3', content: 'Detailed Transactions' },
            styles: { marginBottom: 8 },
        },
        {
            id: 'txt-detail-desc',
            type: 'text',
            props: { content: 'Click column headers to sort. Use "Copy Data" to export to clipboard.' },
            styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 8 },
        },
        {
            id: 'tbl-1',
            type: 'table',
            props: {
                datasourceId: 'ds-sales',
                columns: [
                    { id: 'c-region', field: 'region', label: 'Region', sortable: true },
                    { id: 'c-product', field: 'product', label: 'Product', sortable: true },
                    { id: 'c-quarter', field: 'quarter', label: 'Quarter', sortable: true },
                    { id: 'c-revenue', field: 'revenue', label: 'Revenue ($)', align: 'right' as const, sortable: true },
                    { id: 'c-units', field: 'units', label: 'Units Sold', align: 'right' as const, sortable: true },
                ],
                enableSorting: true,
                enableCopyData: true,
            },
            styles: {},
        },
        {
            id: 'hr-bottom',
            type: 'horizontal-line',
            props: { thickness: 1, marginTop: 16, marginBottom: 8 },
            styles: {},
        },
        {
            id: 'txt-disclaimer',
            type: 'text',
            props: { content: 'Disclaimer: This report contains sample data for demonstration purposes only. Revenue figures are fictional and do not represent actual business performance. Generated by FluxoUI Report Viewer.' },
            styles: { fontSize: 10, textColor: 'var(--eui-text-muted)', fontStyle: 'italic' },
        },
    ],
};
