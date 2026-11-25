import type { TreeTableChildrenPage, TreeTableDropPosition, TreeTableKey } from '../../../components';

export interface FileNode {
    id: string;
    name: string;
    kind: 'folder' | 'file';
    size: number;
    modified: string;
    owner: string;
    children?: FileNode[];
}

export interface ProjectNode {
    id: string;
    name: string;
    owner: string;
    status: 'Planned' | 'Active' | 'Blocked' | 'Done';
    progress: number;
    budget: number;
    spent: number;
    hours: number;
    region: string;
    children?: ProjectNode[];
}

export interface EmployeeRow {
    id: number;
    managerId: number | null;
    name: string;
    title: string;
    department: string;
    salary: number;
}

export interface LazyNode {
    id: string;
    name: string;
    type: 'Region' | 'Store' | 'Order';
    revenue: number;
    items: number;
    hasChildren: boolean;
    children?: LazyNode[];
}

export interface BigNode {
    id: number;
    name: string;
    amount: number;
    quantity: number;
    category: string;
    children?: BigNode[];
}

export const fileTree: FileNode[] = [
    {
        id: 'src',
        name: 'src',
        kind: 'folder',
        size: 0,
        modified: '2026-11-20',
        owner: 'Ava',
        children: [
            {
                id: 'src/components',
                name: 'components',
                kind: 'folder',
                size: 0,
                modified: '2026-11-21',
                owner: 'Ava',
                children: [
                    { id: 'src/components/Button.tsx', name: 'Button.tsx', kind: 'file', size: 8420, modified: '2026-11-18', owner: 'Liam' },
                    { id: 'src/components/Table.tsx', name: 'Table.tsx', kind: 'file', size: 15360, modified: '2026-11-21', owner: 'Ava' },
                    { id: 'src/components/Modal.tsx', name: 'Modal.tsx', kind: 'file', size: 11020, modified: '2026-11-12', owner: 'Noah' },
                ],
            },
            {
                id: 'src/hooks',
                name: 'hooks',
                kind: 'folder',
                size: 0,
                modified: '2026-11-15',
                owner: 'Mia',
                children: [
                    { id: 'src/hooks/useDebounce.ts', name: 'useDebounce.ts', kind: 'file', size: 640, modified: '2026-10-02', owner: 'Mia' },
                    { id: 'src/hooks/useKeyboard.ts', name: 'useKeyboard.ts', kind: 'file', size: 2210, modified: '2026-11-15', owner: 'Mia' },
                ],
            },
            { id: 'src/index.ts', name: 'index.ts', kind: 'file', size: 1180, modified: '2026-11-20', owner: 'Ava' },
        ],
    },
    {
        id: 'docs',
        name: 'docs',
        kind: 'folder',
        size: 0,
        modified: '2026-11-10',
        owner: 'Noah',
        children: [
            { id: 'docs/getting-started.md', name: 'getting-started.md', kind: 'file', size: 5400, modified: '2026-11-10', owner: 'Noah' },
            { id: 'docs/theming.md', name: 'theming.md', kind: 'file', size: 3900, modified: '2026-11-08', owner: 'Liam' },
        ],
    },
    { id: 'package.json', name: 'package.json', kind: 'file', size: 2300, modified: '2026-11-22', owner: 'Ava' },
    { id: 'README.md', name: 'README.md', kind: 'file', size: 9800, modified: '2026-11-19', owner: 'Liam' },
];

export const formatBytes = (value: unknown): string => {
    const bytes = typeof value === 'number' ? value : 0;
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
};

export const formatCurrency = (value: unknown): string =>
    typeof value === 'number' ? value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : '';

export const projectTree: ProjectNode[] = [
    {
        id: 'p1',
        name: 'Website relaunch',
        owner: 'Ava Chen',
        status: 'Active',
        progress: 64,
        budget: 0,
        spent: 0,
        hours: 0,
        region: 'EMEA',
        children: [
            {
                id: 'p1-1',
                name: 'Design system',
                owner: 'Liam Ortiz',
                status: 'Done',
                progress: 100,
                budget: 0,
                spent: 0,
                hours: 0,
                region: 'EMEA',
                children: [
                    { id: 'p1-1-1', name: 'Tokens & themes', owner: 'Liam Ortiz', status: 'Done', progress: 100, budget: 18000, spent: 16400, hours: 120, region: 'EMEA' },
                    { id: 'p1-1-2', name: 'Component audit', owner: 'Mia Patel', status: 'Done', progress: 100, budget: 9000, spent: 9800, hours: 64, region: 'EMEA' },
                ],
            },
            {
                id: 'p1-2',
                name: 'Content migration',
                owner: 'Noah Kim',
                status: 'Active',
                progress: 45,
                budget: 0,
                spent: 0,
                hours: 0,
                region: 'EMEA',
                children: [
                    { id: 'p1-2-1', name: 'Blog archive', owner: 'Noah Kim', status: 'Active', progress: 70, budget: 12000, spent: 7100, hours: 90, region: 'EMEA' },
                    { id: 'p1-2-2', name: 'Product pages', owner: 'Sofia Rossi', status: 'Blocked', progress: 20, budget: 22000, spent: 5200, hours: 48, region: 'EMEA' },
                ],
            },
            { id: 'p1-3', name: 'Launch campaign', owner: 'Ava Chen', status: 'Planned', progress: 0, budget: 30000, spent: 0, hours: 0, region: 'EMEA' },
        ],
    },
    {
        id: 'p2',
        name: 'Mobile app v2',
        owner: 'Ethan Brooks',
        status: 'Active',
        progress: 38,
        budget: 0,
        spent: 0,
        hours: 0,
        region: 'Americas',
        children: [
            { id: 'p2-1', name: 'Offline sync', owner: 'Ethan Brooks', status: 'Active', progress: 55, budget: 40000, spent: 26100, hours: 310, region: 'Americas' },
            { id: 'p2-2', name: 'Push notifications', owner: 'Grace Lee', status: 'Active', progress: 30, budget: 15000, spent: 4800, hours: 72, region: 'Americas' },
            { id: 'p2-3', name: 'Accessibility review', owner: 'Omar Haddad', status: 'Planned', progress: 0, budget: 8000, spent: 0, hours: 0, region: 'Americas' },
        ],
    },
    {
        id: 'p3',
        name: 'Data platform',
        owner: 'Hana Sato',
        status: 'Blocked',
        progress: 12,
        budget: 0,
        spent: 0,
        hours: 0,
        region: 'APAC',
        children: [
            { id: 'p3-1', name: 'Warehouse setup', owner: 'Hana Sato', status: 'Blocked', progress: 15, budget: 52000, spent: 9400, hours: 140, region: 'APAC' },
            { id: 'p3-2', name: 'Reporting layer', owner: 'Ken Tanaka', status: 'Planned', progress: 0, budget: 26000, spent: 0, hours: 0, region: 'APAC' },
        ],
    },
];

export const statusColors: Record<ProjectNode['status'], 'info' | 'primary' | 'danger' | 'success'> = {
    Planned: 'info',
    Active: 'primary',
    Blocked: 'danger',
    Done: 'success',
};

export const employees: EmployeeRow[] = [
    { id: 1, managerId: null, name: 'Olivia Grant', title: 'Chief Executive Officer', department: 'Executive', salary: 320000 },
    { id: 2, managerId: 1, name: 'James Park', title: 'VP Engineering', department: 'Engineering', salary: 240000 },
    { id: 3, managerId: 1, name: 'Sara Ahmed', title: 'VP Sales', department: 'Sales', salary: 225000 },
    { id: 4, managerId: 2, name: 'Leo Martins', title: 'Engineering Manager', department: 'Engineering', salary: 182000 },
    { id: 5, managerId: 2, name: 'Nina Volkova', title: 'Staff Engineer', department: 'Engineering', salary: 196000 },
    { id: 6, managerId: 4, name: 'Tom Becker', title: 'Senior Engineer', department: 'Engineering', salary: 158000 },
    { id: 7, managerId: 4, name: 'Aiko Mori', title: 'Engineer', department: 'Engineering', salary: 128000 },
    { id: 8, managerId: 3, name: 'Carlos Ruiz', title: 'Account Executive', department: 'Sales', salary: 118000 },
    { id: 9, managerId: 3, name: 'Priya Nair', title: 'Sales Engineer', department: 'Sales', salary: 132000 },
    { id: 10, managerId: 1, name: 'Fatima Zahra', title: 'Head of People', department: 'People', salary: 168000 },
];

const regions = ['North', 'South', 'East', 'West', 'Central', 'Coastal', 'Mountain', 'Lakes'];
const regionCount = 400;
const storesPerRegion = 250;
const ordersPerStore = 1000;

const seeded = (seed: number) => {
    const value = Math.sin(seed * 9301 + 49297) * 233280;
    return value - Math.floor(value);
};

export const lazyRoots = (offset: number, limit: number): LazyNode[] =>
    Array.from({ length: Math.max(0, Math.min(limit, regionCount - offset)) }, (_, index) => {
        const id = offset + index;
        return {
            id: `r${id}`,
            name: `${regions[id % regions.length]} region #${id + 1}`,
            type: 'Region',
            revenue: Math.round(200000 + seeded(id) * 800000),
            items: Math.round(4000 + seeded(id + 7) * 9000),
            hasChildren: true,
        };
    });

export const totalLazyRoots = regionCount;

const wait = (ms: number, signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        });
    });

export const fetchLazyChildren = async (row: LazyNode, offset: number, signal: AbortSignal): Promise<TreeTableChildrenPage<LazyNode>> => {
    await wait(500 + Math.round(seeded(offset + row.id.length) * 400), signal);
    const pageSize = 50;
    const total = row.type === 'Region' ? storesPerRegion : ordersPerStore;
    const count = Math.max(0, Math.min(pageSize, total - offset));
    const rows: LazyNode[] = Array.from({ length: count }, (_, index) => {
        const position = offset + index;
        const seed = position + row.id.length * 31;
        if (row.type === 'Region') {
            return {
                id: `${row.id}-s${position}`,
                name: `Store ${position + 1}`,
                type: 'Store',
                revenue: Math.round(800 + seeded(seed) * 4000),
                items: Math.round(10 + seeded(seed + 3) * 60),
                hasChildren: true,
            };
        }
        return {
            id: `${row.id}-o${position}`,
            name: `Order #${(position + 1).toString().padStart(5, '0')}`,
            type: 'Order',
            revenue: Math.round(20 + seeded(seed) * 400),
            items: Math.round(1 + seeded(seed + 5) * 8),
            hasChildren: false,
        };
    });
    return { rows, hasMore: offset + count < total };
};

export const fetchRootPage = (offset: number, limit: number) =>
    new Promise<LazyNode[]>((resolve) => {
        setTimeout(() => resolve(lazyRoots(offset, limit)), 600);
    });

const categories = ['Hardware', 'Software', 'Services', 'Support', 'Training'];

export const buildBigTree = (roots: number, childrenPerRoot: number): { data: BigNode[]; total: number } => {
    const data: BigNode[] = new Array(roots);
    let id = 0;
    for (let r = 0; r < roots; r += 1) {
        const rootId = id;
        id += 1;
        const children: BigNode[] = new Array(childrenPerRoot);
        for (let c = 0; c < childrenPerRoot; c += 1) {
            children[c] = {
                id,
                name: `Line item ${c + 1}`,
                amount: Math.round(seeded(id) * 10000) / 100,
                quantity: 1 + Math.floor(seeded(id + 1) * 20),
                category: categories[id % categories.length],
            };
            id += 1;
        }
        data[r] = { id: rootId, name: `Account ${r + 1}`, amount: 0, quantity: 0, category: categories[r % categories.length], children };
    }
    return { data, total: id };
};

export const bigTreeSizes = [
    { label: '10K rows', value: '10000' },
    { label: '100K rows', value: '100000' },
    { label: '1M rows', value: '1000000' },
];

const cloneNodes = <T extends { children?: T[] }>(nodes: T[]): T[] => nodes.map((node) => ({ ...node, children: node.children ? cloneNodes(node.children) : undefined }));

const findPath = <T extends { id: TreeTableKey; children?: T[] }>(nodes: T[], key: TreeTableKey): { list: T[]; index: number } | null => {
    for (let index = 0; index < nodes.length; index += 1) {
        if (nodes[index].id === key) return { list: nodes, index };
        const nested = nodes[index].children;
        if (nested) {
            const found = findPath(nested, key);
            if (found) return found;
        }
    }
    return null;
};

export const moveNode = <T extends { id: TreeTableKey; children?: T[] }>(
    nodes: T[],
    sourceKey: TreeTableKey,
    targetKey: TreeTableKey,
    position: TreeTableDropPosition,
): T[] => {
    const next = cloneNodes(nodes);
    const source = findPath(next, sourceKey);
    if (!source) return nodes;
    const [moved] = source.list.splice(source.index, 1);
    const target = findPath(next, targetKey);
    if (!target) return nodes;
    if (position === 'inside') {
        const parent = target.list[target.index];
        parent.children = [...(parent.children ?? []), moved];
    } else {
        target.list.splice(position === 'before' ? target.index : target.index + 1, 0, moved);
    }
    return next;
};

export const updateNode = <T extends { id: TreeTableKey; children?: T[] }>(nodes: T[], key: TreeTableKey, patch: Partial<T>): T[] =>
    nodes.map((node) => {
        if (node.id === key) return { ...node, ...patch };
        if (node.children) return { ...node, children: updateNode(node.children, key, patch) };
        return node;
    });
