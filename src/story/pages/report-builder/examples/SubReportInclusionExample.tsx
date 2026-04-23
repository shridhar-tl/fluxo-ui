import React from 'react';
import {
    createEmptyDefinition,
    type ReportDefinition,
    type SubReportDefinition,
} from '../../../../components/report-builder';
import { orders } from '../example-data';
import { ExampleShowcase, type ExpressionHighlight } from './ExampleShowcase';

const subReportDefinition: ReportDefinition = (() => {
    const base = createEmptyDefinition('Region Detail');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
            {
                id: 'ds-regionOrders',
                name: 'regionOrders',
                type: 'derived',
                config: {
                    sourceDatasourceId: 'ds-orders',
                    transforms: [{ type: 'filter', expression: 'Field.region == Parameters.region' }],
                },
            },
        ],
        parameters: [
            {
                id: 'p-region',
                name: 'region',
                type: 'text',
                label: 'Region',
                mandatory: true,
                typeConfig: {},
                defaultValue: 'North',
                width: 1,
            },
        ],
        variables: [],
        components: [
            {
                id: 'c-header',
                type: 'header',
                props: { level: 'h4', content: '=Concat("Region Detail — ", Parameters.region)' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'c-text',
                type: 'text',
                props: {
                    content:
                        '=Concat("Total orders: ", Count(Datasources.regionOrders.id), " · Total revenue: ", FormatCurrency(Sum(Datasources.regionOrders.revenue), "$", 0))',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 8 },
            },
            {
                id: 'c-chart',
                type: 'chart-bar',
                props: {
                    datasourceId: 'ds-regionOrders',
                    title: '=Concat("Revenue by category in ", Parameters.region)',
                    xAxisField: 'category',
                    yAxisField: 'revenue',
                    barColor: '#8b5cf6',
                    height: 240,
                    showLegend: false,
                    tooltipValueFormat: 'currency',
                },
                styles: {},
            },
        ],
    };
})();

const availableSubReports: SubReportDefinition[] = [
    { id: 'sr-region-detail', label: 'Region Detail', definition: subReportDefinition },
];

const definition: ReportDefinition = (() => {
    const base = createEmptyDefinition('Regional Overview with Drill-in');
    return {
        ...base,
        datasources: [
            { id: 'ds-orders', name: 'orders', type: 'static-json', config: { json: JSON.stringify(orders) } },
        ],
        parameters: [
            {
                id: 'p-region',
                name: 'region',
                type: 'dropdown',
                label: 'Region',
                mandatory: false,
                typeConfig: {
                    options: [
                        { label: 'North', value: 'North' },
                        { label: 'South', value: 'South' },
                        { label: 'East', value: 'East' },
                        { label: 'West', value: 'West' },
                    ],
                },
                defaultValue: 'North',
                width: 1,
            },
        ],
        variables: [],
        components: [
            {
                id: 'hdr',
                type: 'header',
                props: { level: 'h2', content: 'Regional Overview with Drill-in' },
                styles: { marginBottom: 4 },
            },
            {
                id: 'sub',
                type: 'text',
                props: {
                    content:
                        'The report below consists of a compact totals row followed by a sub-report. The sub-report is its own ReportDefinition — a chart with a derived datasource filtered by the region parameter. Changing the Region parameter re-evaluates both the summary and the embedded sub-report.',
                },
                styles: { textColor: 'var(--eui-text-muted)', fontSize: 12, marginBottom: 12 },
            },
            {
                id: 'summary',
                type: 'text',
                props: {
                    content:
                        '=Concat("Across all regions: ", Count(Datasources.orders.id), " orders, ", FormatCurrency(Sum(Datasources.orders.revenue), "$", 0), " revenue.")',
                },
                styles: {
                    backgroundColor: 'var(--eui-bg-subtle)',
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 12,
                    paddingRight: 12,
                    borderRadius: 6,
                    fontSize: 13,
                    marginBottom: 12,
                },
            },
            {
                id: 'sr-detail',
                type: 'sub-report',
                props: {
                    subReportId: 'sr-region-detail',
                    parameterMap: { region: '=Parameters.region' },
                },
                styles: {},
            },
        ],
    };
})();

const highlights: ExpressionHighlight[] = [
    {
        label: 'Sub-report parameter mapping',
        expression: 'parameterMap: { region: "=Parameters.region" }',
        explanation:
            'Each entry is a parameter name on the child sub-report mapped to a literal or an =expression evaluated in the parent context.',
    },
    {
        label: 'Derived filter inside the sub-report',
        expression: '{ type: "filter", expression: "Field.region == Parameters.region" }',
        explanation:
            'The sub-report declares its own derived datasource. The filter expression reads Parameters.region — which is populated from the parent\'s parameterMap at render time.',
    },
    {
        label: 'Aggregate over the derived dataset',
        expression: "Sum(Datasources.regionOrders.revenue)",
        explanation:
            'Aggregates inside the sub-report target the derived datasource, so totals automatically reflect the region that was passed in.',
    },
];

export const SubReportInclusionExample: React.FC = () => (
    <ExampleShowcase
        title="8 · Sub-report inclusion"
        description="A report that embeds another report. The inner report receives a region parameter from the outer report and filters its data accordingly."
        definition={definition}
        highlights={highlights}
        subReportDefinitions={availableSubReports}
    />
);
