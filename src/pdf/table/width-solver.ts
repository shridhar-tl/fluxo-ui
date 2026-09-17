import type { ResolvedColumn } from './table-types';

export interface WidthConstraint {
    index: number;
    natural: number;
    floor: number;
    preferred: number;
    fixed: boolean;
}

export function buildConstraints(columns: ResolvedColumn[]): WidthConstraint[] {
    return columns.map((column) => {
        const explicitWidth = typeof column.definition?.width === 'number' ? column.definition.width : undefined;
        const declaredMin = column.definition?.minWidth;
        const declaredMax = column.definition?.maxWidth;

        let natural = explicitWidth ?? column.naturalWidth;
        if (declaredMax !== undefined) natural = Math.min(natural, declaredMax);

        const floor = explicitWidth ?? Math.max(column.minWidth, declaredMin ?? 0);

        return {
            index: column.index,
            natural,
            floor: Math.min(floor, natural),
            preferred: Math.max(Math.min(column.readableWidth, natural), floor),
            fixed: explicitWidth !== undefined || column.definition?.width === 'shrink',
        };
    });
}

function distribute(
    constraints: WidthConstraint[],
    widths: number[],
    surplus: number,
    lowerBound: (constraint: WidthConstraint) => number,
): number {
    const adjustable = constraints.filter((constraint) => !constraint.fixed);
    if (adjustable.length === 0) return surplus;

    let remaining = surplus;
    let iterationBudget = adjustable.length + 2;

    while (Math.abs(remaining) > 0.01 && iterationBudget > 0) {
        iterationBudget -= 1;

        const eligible = adjustable.filter((constraint) =>
            remaining > 0 ? true : widths[constraint.index] > lowerBound(constraint) + 0.01,
        );
        if (eligible.length === 0) break;

        const totalWeight = eligible.reduce((sum, constraint) => sum + Math.max(widths[constraint.index], 0.01), 0);
        if (totalWeight <= 0) break;

        let consumed = 0;

        for (const constraint of eligible) {
            const share = (Math.max(widths[constraint.index], 0.01) / totalWeight) * remaining;
            const target = widths[constraint.index] + share;
            const bounded = remaining > 0 ? target : Math.max(target, lowerBound(constraint));
            consumed += bounded - widths[constraint.index];
            widths[constraint.index] = bounded;
        }

        remaining -= consumed;
        if (Math.abs(consumed) < 0.001) break;
    }

    return remaining;
}

export interface SolveResult {
    widths: number[];
    overflow: number;
}

export function solveColumnWidths(columns: ResolvedColumn[], availableWidth: number): SolveResult {
    const constraints = buildConstraints(columns);
    const widths = constraints.map((constraint) => constraint.natural);

    const naturalTotal = widths.reduce((sum, width) => sum + width, 0);
    let surplus = availableWidth - naturalTotal;

    if (Math.abs(surplus) > 0.01) {
        surplus = distribute(constraints, widths, surplus, (constraint) => constraint.preferred);
    }

    if (surplus < -0.01) {
        surplus = distribute(constraints, widths, surplus, (constraint) => constraint.floor);
    }

    return { widths, overflow: surplus < -0.01 ? -surplus : 0 };
}

export function splitColumnsAcrossPages(
    columns: ResolvedColumn[],
    availableWidth: number,
    repeatedIndices: number[],
): ResolvedColumn[][] {
    const repeated = repeatedIndices
        .map((index) => columns[index])
        .filter((column): column is ResolvedColumn => column !== undefined);

    const repeatedWidth = repeated.reduce((sum, column) => sum + column.width, 0);
    const flowing = columns.filter((column) => !repeatedIndices.includes(column.index));

    const groups: ResolvedColumn[][] = [];
    let current: ResolvedColumn[] = [];
    let currentWidth = repeatedWidth;

    for (const column of flowing) {
        if (current.length > 0 && currentWidth + column.width > availableWidth) {
            groups.push([...repeated, ...current]);
            current = [];
            currentWidth = repeatedWidth;
        }
        current.push(column);
        currentWidth += column.width;
    }

    if (current.length > 0) groups.push([...repeated, ...current]);

    return groups.length > 0 ? groups : [columns];
}
