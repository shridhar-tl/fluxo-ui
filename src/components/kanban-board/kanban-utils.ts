import { KanbanCardData, KanbanColumnData, KanbanColumnId, KanbanPriority, KanbanSearchFilter } from './kanban-types';

const priorityOrder: Record<KanbanPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    none: 4,
};

export function getCardsForColumn(cards: KanbanCardData[], columnId: KanbanColumnId): KanbanCardData[] {
    return cards
        .filter((card) => card.columnId === columnId)
        .sort((a, b) => a.order - b.order);
}

export function filterCards(cards: KanbanCardData[], filter: KanbanSearchFilter): KanbanCardData[] {
    let result = cards;

    if (filter.query) {
        const q = filter.query.toLowerCase();
        result = result.filter(
            (card) =>
                card.title.toLowerCase().includes(q) ||
                card.description?.toLowerCase().includes(q),
        );
    }

    if (filter.priority?.length) {
        result = result.filter((card) => card.priority && filter.priority!.includes(card.priority));
    }

    if (filter.labels?.length) {
        result = result.filter((card) =>
            card.labels?.some((label) => filter.labels!.includes(label.id)),
        );
    }

    if (filter.assignees?.length) {
        result = result.filter((card) => {
            if (card.assignees?.length) {
                return card.assignees.some((a) => filter.assignees!.includes(a.id));
            }
            return card.assignee && filter.assignees!.includes(card.assignee.id);
        });
    }

    return result;
}

export function getPriorityOrder(priority: KanbanPriority): number {
    return priorityOrder[priority] ?? 4;
}

export function getPriorityLabel(priority: KanbanPriority): string {
    const labels: Record<KanbanPriority, string> = {
        critical: 'Critical',
        high: 'High',
        low: 'Low',
        medium: 'Medium',
        none: 'None',
    };
    return labels[priority] ?? 'None';
}

export function isColumnOverLimit(column: KanbanColumnData, cardCount: number): boolean {
    return column.limit !== undefined && column.limit > 0 && cardCount > column.limit;
}

export function reorderCards(
    cards: KanbanCardData[],
    columnId: KanbanColumnId,
    fromIndex: number,
    toIndex: number,
): KanbanCardData[] {
    const columnCards = getCardsForColumn(cards, columnId);
    const [moved] = columnCards.splice(fromIndex, 1);
    columnCards.splice(toIndex, 0, moved);

    const reordered = columnCards.map((card, i) => ({ ...card, order: i }));
    return cards.map((card) => {
        if (card.columnId !== columnId) return card;
        const updated = reordered.find((c) => c.id === card.id);
        return updated ?? card;
    });
}

export function moveCard(
    cards: KanbanCardData[],
    cardId: string | number,
    fromColumnId: KanbanColumnId,
    toColumnId: KanbanColumnId,
    toIndex: number,
): KanbanCardData[] {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return cards;

    const fromCards = getCardsForColumn(cards, fromColumnId).filter((c) => c.id !== cardId);
    const toCards = toColumnId === fromColumnId
        ? fromCards
        : getCardsForColumn(cards, toColumnId);

    const movedCard = { ...card, columnId: toColumnId, order: toIndex };
    toCards.splice(toIndex, 0, movedCard);

    const reorderedFrom = fromCards.map((c, i) => ({ ...c, order: i }));
    const reorderedTo = toCards.map((c, i) => ({ ...c, order: i }));

    const updatedMap = new Map<string | number, KanbanCardData>();
    for (const c of [...reorderedFrom, ...reorderedTo]) {
        updatedMap.set(c.id, c);
    }

    return cards.map((c) => updatedMap.get(c.id) ?? c);
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function formatDueDate(date: Date | string): { text: string; isOverdue: boolean; isDueSoon: boolean } {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isDueSoon: false };
    }
    if (diffDays === 0) {
        return { text: 'Due today', isOverdue: false, isDueSoon: true };
    }
    if (diffDays === 1) {
        return { text: 'Due tomorrow', isOverdue: false, isDueSoon: true };
    }
    if (diffDays <= 3) {
        return { text: `Due in ${diffDays}d`, isOverdue: false, isDueSoon: true };
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { text: `${monthNames[d.getMonth()]} ${d.getDate()}`, isOverdue: false, isDueSoon: false };
}
