import type { ReportComponent, ColumnsComponentProps, TabComponentProps, CanvasItemLayout } from './report-definition-types';

const columnCellAllowed = new Set([
    'header', 'text', 'image', 'horizontal-line', 'tab', 'table',
    'sub-report', 'chart-bar', 'chart-pie', 'chart-donut', 'chart-line',
]);
const tabPanelAllowed = new Set([
    'header', 'text', 'image', 'horizontal-line', 'columns', 'table',
    'sub-report', 'chart-bar', 'chart-pie', 'chart-donut', 'chart-line',
]);

const canvasAllowed = new Set([
    'header', 'text', 'image', 'horizontal-line', 'table',
    'sub-report', 'chart-bar', 'chart-pie', 'chart-donut', 'chart-line',
]);

export function isTypeAllowedInContainer(
    componentType: string,
    containerType: 'column' | 'tab-panel' | 'canvas',
): boolean {
    if (containerType === 'column') return columnCellAllowed.has(componentType);
    if (containerType === 'tab-panel') return tabPanelAllowed.has(componentType);
    if (containerType === 'canvas') return canvasAllowed.has(componentType);
    return true;
}

export function isDragAllowedInContainer(
    dataTransferTypes: readonly string[],
    containerType: 'column' | 'tab-panel' | 'canvas',
): boolean {
    const typePrefix = 'application/rb-type-';
    const draggedType = dataTransferTypes.find((t) => t.startsWith(typePrefix));
    if (!draggedType) return true;
    const componentType = draggedType.slice(typePrefix.length);
    return isTypeAllowedInContainer(componentType, containerType);
}

export function findComponent(components: ReportComponent[], id: string): ReportComponent | null {
    for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children) {
            const found = findComponent(comp.children, id);
            if (found) return found;
        }
    }
    return null;
}

export function updateComponentInTree(
    components: ReportComponent[],
    id: string,
    updater: (comp: ReportComponent) => ReportComponent,
): ReportComponent[] {
    return components.map((comp) => {
        if (comp.id === id) return updater(comp);
        if (comp.children) {
            return { ...comp, children: updateComponentInTree(comp.children, id, updater) };
        }
        return comp;
    });
}

export function deleteComponentFromTree(components: ReportComponent[], id: string): ReportComponent[] {
    return components
        .filter((comp) => comp.id !== id)
        .map((comp) => {
            if (comp.children) {
                return { ...comp, children: deleteComponentFromTree(comp.children, id) };
            }
            return comp;
        });
}

export function insertIntoContainer(
    components: ReportComponent[],
    containerId: string,
    newComp: ReportComponent,
    insertIndex: number,
): ReportComponent[] {
    return components.map((comp) => {
        if (comp.id === containerId) {
            const next = [...(comp.children ?? [])];
            next.splice(insertIndex, 0, newComp);
            return { ...comp, children: next };
        }
        if (comp.children) {
            return { ...comp, children: insertIntoContainer(comp.children, containerId, newComp, insertIndex) };
        }
        return comp;
    });
}

export function moveWithinContainer(
    components: ReportComponent[],
    containerId: string,
    fromIndex: number,
    toIndex: number,
): ReportComponent[] {
    return components.map((comp) => {
        if (comp.id === containerId) {
            const next = [...(comp.children ?? [])];
            const [removed] = next.splice(fromIndex, 1);
            const adjusted = toIndex > fromIndex ? toIndex - 1 : toIndex;
            next.splice(adjusted, 0, removed);
            return { ...comp, children: next };
        }
        if (comp.children) {
            return { ...comp, children: moveWithinContainer(comp.children, containerId, fromIndex, toIndex) };
        }
        return comp;
    });
}

export function duplicateComponent(components: ReportComponent[], id: string): ReportComponent[] {
    const result: ReportComponent[] = [];
    for (const comp of components) {
        result.push(comp);
        if (comp.id === id) {
            result.push(deepCloneWithNewIds(comp));
        } else if (comp.children) {
            const updated = { ...comp, children: duplicateComponent(comp.children, id) };
            result[result.length - 1] = updated;
        }
    }
    return result;
}

export function createCanvasChild(type: string): ReportComponent {
    const comp = createComponent(type);
    const defaultLayout: CanvasItemLayout = { x: 20, y: 20, width: 200, height: 100 };
    comp.props = { ...comp.props, canvasLayout: defaultLayout };
    return comp;
}

function deepCloneWithNewIds(comp: ReportComponent): ReportComponent {
    return {
        ...comp,
        id: crypto.randomUUID(),
        props: { ...comp.props },
        styles: { ...comp.styles },
        children: comp.children ? comp.children.map(deepCloneWithNewIds) : undefined,
    };
}

export function createComponent(type: string): ReportComponent {
    switch (type) {
        case 'header':
            return {
                id: crypto.randomUUID(),
                type,
                props: { level: 'h2', content: 'Heading' } satisfies Record<string, unknown>,
                styles: {},
            };
        case 'text':
            return {
                id: crypto.randomUUID(),
                type,
                props: { content: 'Enter text here...' } satisfies Record<string, unknown>,
                styles: {},
            };
        case 'image':
            return {
                id: crypto.randomUUID(),
                type,
                props: { src: '', alt: '', objectFit: 'contain', width: '100%', height: 'auto' } satisfies Record<string, unknown>,
                styles: {},
            };
        case 'horizontal-line':
            return {
                id: crypto.randomUUID(),
                type,
                props: { thickness: 1, marginTop: 8, marginBottom: 8 } satisfies Record<string, unknown>,
                styles: {},
            };
        case 'columns': {
            const col1Id = crypto.randomUUID();
            const col2Id = crypto.randomUUID();
            const props: ColumnsComponentProps = { columnCount: 2 };
            return {
                id: crypto.randomUUID(),
                type,
                props: props as unknown as Record<string, unknown>,
                styles: {},
                children: [
                    { id: col1Id, type: 'column', props: {}, styles: {}, children: [] },
                    { id: col2Id, type: 'column', props: {}, styles: {}, children: [] },
                ],
            };
        }
        case 'tab': {
            const tab1Id = crypto.randomUUID();
            const panelId = crypto.randomUUID();
            const props: TabComponentProps = {
                tabs: [{ id: tab1Id, label: 'Tab 1' }],
                defaultTabId: tab1Id,
            };
            return {
                id: crypto.randomUUID(),
                type,
                props: props as unknown as Record<string, unknown>,
                styles: {},
                children: [
                    { id: panelId, type: 'tab-panel', props: { tabId: tab1Id }, styles: {}, children: [] },
                ],
            };
        }
        case 'table':
            return {
                id: crypto.randomUUID(),
                type,
                props: { datasourceId: '', columns: [] },
                styles: {},
            };
        case 'sub-report':
            return {
                id: crypto.randomUUID(),
                type,
                props: { subReportId: '', parameterMap: {} },
                styles: {},
            };
        case 'chart-bar':
            return {
                id: crypto.randomUUID(),
                type,
                props: { datasourceId: '', title: 'Bar Chart', showLegend: true, xAxisField: '', yAxisField: '', barColor: '#4f87f7' },
                styles: {},
            };
        case 'chart-pie':
            return {
                id: crypto.randomUUID(),
                type,
                props: { datasourceId: '', title: 'Pie Chart', showLegend: true, labelField: '', valueField: '', colors: [] },
                styles: {},
            };
        case 'chart-donut':
            return {
                id: crypto.randomUUID(),
                type,
                props: { datasourceId: '', title: 'Donut Chart', showLegend: true, labelField: '', valueField: '', colors: [] },
                styles: {},
            };
        case 'chart-line':
            return {
                id: crypto.randomUUID(),
                type,
                props: { datasourceId: '', title: 'Line Chart', showLegend: true, xAxisField: '', yAxisField: '', lineColor: '#4f87f7', lineTension: 0.3, showPoints: true },
                styles: {},
            };
        case 'canvas':
            return {
                id: crypto.randomUUID(),
                type,
                props: { width: '100%', height: '400px' },
                styles: {},
                children: [],
            };
        default:
            return {
                id: crypto.randomUUID(),
                type,
                props: {},
                styles: {},
            };
    }
}
