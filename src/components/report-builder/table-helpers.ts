import type {
    TableColumnDef,
    TableColumnGroup,
    TableColumnGroupNode,
    TableColumnNode,
    TableComponentProps,
} from './report-definition-types';

export function isLeafColumn(node: TableColumnNode): node is TableColumnDef {
    return (node as TableColumnGroupNode).kind !== 'group';
}

export function isGroupColumn(node: TableColumnNode): node is TableColumnGroupNode {
    return (node as TableColumnGroupNode).kind === 'group';
}

export function flattenColumns(tree: TableColumnNode[]): TableColumnDef[] {
    const out: TableColumnDef[] = [];
    const walk = (nodes: TableColumnNode[]) => {
        for (const n of nodes) {
            if (isLeafColumn(n)) out.push(n);
            else walk(n.children);
        }
    };
    walk(tree);
    return out;
}

export function getColumnTreeDepth(tree: TableColumnNode[]): number {
    if (tree.length === 0) return 0;
    let max = 1;
    for (const n of tree) {
        if (isGroupColumn(n)) {
            const d = 1 + getColumnTreeDepth(n.children);
            if (d > max) max = d;
        }
    }
    return max;
}

export function getLeafCountForNode(node: TableColumnNode): number {
    if (isLeafColumn(node)) return 1;
    let count = 0;
    for (const child of node.children) count += getLeafCountForNode(child);
    return count;
}

export function findColumnNodeById(
    tree: TableColumnNode[],
    id: string,
): TableColumnNode | null {
    for (const n of tree) {
        if (n.id === id) return n;
        if (isGroupColumn(n)) {
            const found = findColumnNodeById(n.children, id);
            if (found) return found;
        }
    }
    return null;
}

export function updateColumnNodeInTree(
    tree: TableColumnNode[],
    id: string,
    updater: (node: TableColumnNode) => TableColumnNode,
): TableColumnNode[] {
    return tree.map((n) => {
        if (n.id === id) return updater(n);
        if (isGroupColumn(n)) {
            return { ...n, children: updateColumnNodeInTree(n.children, id, updater) };
        }
        return n;
    });
}

export function removeColumnNodeFromTree(
    tree: TableColumnNode[],
    id: string,
): TableColumnNode[] {
    const result: TableColumnNode[] = [];
    for (const n of tree) {
        if (n.id === id) continue;
        if (isGroupColumn(n)) {
            result.push({ ...n, children: removeColumnNodeFromTree(n.children, id) });
        } else {
            result.push(n);
        }
    }
    return result;
}

export function insertColumnNodeUnderParent(
    tree: TableColumnNode[],
    parentId: string | null,
    node: TableColumnNode,
    index?: number,
): TableColumnNode[] {
    if (parentId === null) {
        const next = [...tree];
        const at = index ?? next.length;
        next.splice(at, 0, node);
        return next;
    }
    return tree.map((n) => {
        if (n.id === parentId && isGroupColumn(n)) {
            const next = [...n.children];
            const at = index ?? next.length;
            next.splice(at, 0, node);
            return { ...n, children: next };
        }
        if (isGroupColumn(n)) {
            return { ...n, children: insertColumnNodeUnderParent(n.children, parentId, node, index) };
        }
        return n;
    });
}

/**
 * Migrate a legacy TableComponentProps (flat `columns` + `columnGroups` with columnIds)
 * into the new recursive `columnTree`. Non-destructive: both shapes stay on the props
 * but the renderer always reads `columnTree`.
 */
export function getEffectiveColumnTree(p: TableComponentProps): TableColumnNode[] {
    if (p.columnTree && p.columnTree.length > 0) return p.columnTree;
    return legacyColumnsToTree(p.columns, p.columnGroups);
}

export function legacyColumnsToTree(
    columns: TableColumnDef[],
    columnGroups?: TableColumnGroup[],
): TableColumnNode[] {
    if (!columnGroups || columnGroups.length === 0) {
        return columns.map((c) => ({ ...c, kind: 'column' as const }));
    }
    const colById = new Map(columns.map((c) => [c.id, c]));
    const groupedColIds = new Set(columnGroups.flatMap((g) => g.columnIds));
    const out: TableColumnNode[] = [];
    const seen = new Set<string>();

    for (const col of columns) {
        if (seen.has(col.id)) continue;
        const ownerGroup = columnGroups.find((g) => g.columnIds[0] === col.id);
        if (ownerGroup) {
            const children: TableColumnNode[] = [];
            for (const cid of ownerGroup.columnIds) {
                const c = colById.get(cid);
                if (c) {
                    children.push({ ...c, kind: 'column' });
                    seen.add(cid);
                }
            }
            out.push({
                kind: 'group',
                id: ownerGroup.id,
                label: ownerGroup.label,
                visible: ownerGroup.visible,
                children,
            });
            continue;
        }
        if (!groupedColIds.has(col.id)) {
            out.push({ ...col, kind: 'column' });
            seen.add(col.id);
        }
    }
    return out;
}

export function columnTreeToLegacy(tree: TableColumnNode[]): {
    columns: TableColumnDef[];
    columnGroups: TableColumnGroup[];
} {
    const columns: TableColumnDef[] = [];
    const columnGroups: TableColumnGroup[] = [];
    const walk = (nodes: TableColumnNode[]) => {
        for (const n of nodes) {
            if (isLeafColumn(n)) {
                const { kind: _kind, ...rest } = n;
                columns.push({ ...rest });
            } else {
                const leafIds: string[] = [];
                const collectLeaves = (nn: TableColumnNode[]) => {
                    for (const x of nn) {
                        if (isLeafColumn(x)) leafIds.push(x.id);
                        else collectLeaves(x.children);
                    }
                };
                collectLeaves(n.children);
                columnGroups.push({
                    id: n.id,
                    label: n.label,
                    visible: n.visible,
                    columnIds: leafIds,
                });
                walk(n.children);
            }
        }
    };
    walk(tree);
    return { columns, columnGroups };
}
