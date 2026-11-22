const componentTypeLabels: Record<string, string> = {
    header: 'Header',
    text: 'Text',
    image: 'Image',
    'horizontal-line': 'Horizontal Line',
    columns: 'Columns',
    tab: 'Tabs',
    canvas: 'Canvas',
    repeater: 'Repeater',
    table: 'Table',
    'sub-report': 'Sub-report',
    'chart-bar': 'Bar Chart',
    'chart-horizontal-bar': 'Horizontal Bar',
    'chart-stacked-bar': 'Stacked Bar',
    'chart-line': 'Line Chart',
    'chart-area': 'Area Chart',
    'chart-pie': 'Pie Chart',
    'chart-donut': 'Donut Chart',
    'chart-polar-area': 'Polar Area',
    'chart-radar': 'Radar Chart',
    'chart-scatter': 'Scatter Plot',
    'chart-bubble': 'Bubble Chart',
};

/** The name of a built-in component type as the designer shows it, or undefined for a type it does not know. */
export function getComponentTypeLabel(type: string): string | undefined {
    return componentTypeLabels[type];
}
