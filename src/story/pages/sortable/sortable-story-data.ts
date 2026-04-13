export interface Task {
    id: number;
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
}

export interface KanbanItem {
    id: number;
    text: string;
    type: string;
}

export const getPriorityColor = (priority?: string) => {
    switch (priority) {
        case 'high':
            return 'bg-red-500';
        case 'medium':
            return 'bg-yellow-500';
        case 'low':
            return 'bg-green-500';
        default:
            return 'bg-gray-400';
    }
};

export const getTypeIcon = (type: string) => {
    switch (type) {
        case 'bug':
            return '🐛';
        case 'feature':
            return '✨';
        case 'docs':
            return '📝';
        case 'review':
            return '👀';
        case 'devops':
            return '⚙️';
        default:
            return '📌';
    }
};

export const columnTitles: Record<string, string> = {
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
};

export const columnColors: Record<string, string> = {
    todo: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700',
    inProgress: 'bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 border-yellow-200 dark:border-yellow-700/50',
    done: 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-700/50',
};
