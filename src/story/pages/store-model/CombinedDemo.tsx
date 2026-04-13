import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { Button, Dropdown, SelectButton, TextArea, TextInput } from '../../../components';
import { createItemHook, createModel } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    createdAt: number;
    completedAt: number | null;
}

let taskIdCounter = 0;
const combinedPersistKey = 'fluxo-ui-demo-task-manager';

const loadPersistedTasks = (): Task[] => {
    try {
        const stored = localStorage.getItem(combinedPersistKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {}
    return [];
};

const persistAllTasks = (tasks: Task[]) => {
    try {
        localStorage.setItem(combinedPersistKey, JSON.stringify(tasks));
    } catch {}
};

const taskFactory = createModel<Task>({
    nextId: () => ++taskIdCounter,
    createWithDefaults: (id) => ({
        id,
        title: '',
        description: '',
        status: 'todo' as TaskStatus,
        priority: 'medium' as TaskPriority,
        createdAt: Date.now(),
        completedAt: null,
    }),
    selectId: (state) => state.id,
    validate: (state) => {
        const errors: Record<string, string | object> = {};
        if (!state.title.trim()) errors.title = 'Title is required';
        else if (state.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
        return Object.keys(errors).length > 0
            ? (errors as Partial<Record<keyof Task, string | object>> & Record<string, object>)
            : undefined;
    },
    validateBehavior: 'change',
});

const code = `import { createModel, createItemHook } from 'fluxo-ui/store';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    createdAt: number;
    completedAt: number | null;
}

const taskFactory = createModel<Task>({
    nextId: () => ++taskIdCounter,
    createWithDefaults: (id) => ({
        id, title: '', description: '', status: 'todo',
        priority: 'medium', createdAt: Date.now(), completedAt: null,
    }),
    selectId: (state) => state.id,
    validate: (state) => {
        const errors = {};
        if (!state.title.trim()) errors.title = 'Title is required';
        return Object.keys(errors).length > 0 ? errors : undefined;
    },
    validateBehavior: 'change',
});

// Create with validation
const store = taskFactory.create({ title: 'Build feature' });
store.setState({ status: 'in-progress' });
store.setState({ status: 'done', completedAt: Date.now() });

// List with pagination & sorting
const list = taskFactory.list({ itemsPerPage: 50, sortBy: 'createdAt' });

// Manual persistence across all tasks
const allTasks = list.items;
localStorage.setItem('tasks', JSON.stringify(allTasks));`;

const priorityConfig: Record<TaskPriority, { label: string; dotClass: string }> = {
    low: { label: 'Low', dotClass: 'bg-blue-400' },
    medium: { label: 'Medium', dotClass: 'bg-amber-400' },
    high: { label: 'High', dotClass: 'bg-red-400' },
};

const statusConfig: Record<TaskStatus, { label: string; badgeClass: string; badgeClassLight: string }> = {
    todo: { label: 'To Do', badgeClass: 'bg-gray-500/20 text-gray-400', badgeClassLight: 'bg-gray-100 text-gray-600' },
    'in-progress': { label: 'In Progress', badgeClass: 'bg-blue-500/20 text-blue-400', badgeClassLight: 'bg-blue-50 text-blue-600' },
    done: { label: 'Done', badgeClass: 'bg-green-500/20 text-green-400', badgeClassLight: 'bg-green-50 text-green-600' },
};

const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
];

const filterItems = [
    { label: 'All', value: 'all' },
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Done', value: 'done' },
];

const formatDate = (ts: number) => {
    const d = new Date(ts);
    return (
        d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
        ' ' +
        d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    );
};

interface TaskCardProps {
    taskId: number;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ taskId, onDelete, onStatusChange }) => {
    const { isDark } = useStoryTheme();
    const store = taskFactory.get(taskId);
    const useItem = useMemo(() => (store ? createItemHook(store) : null), [store]);
    const task = useItem?.() as
        | (Task & { id: number; isStale: boolean; isLoading: boolean; isSaving: boolean; isDeleting: boolean })
        | undefined;

    if (!task) return null;

    const priority = priorityConfig[task.priority];
    const status = statusConfig[task.status];
    const nextStatus: TaskStatus = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';

    return (
        <div
            className={cn('rounded-lg border p-3 transition-all group', {
                'border-white/10 bg-white/5 hover:bg-white/8': isDark,
                'border-gray-200 bg-white hover:shadow-sm': !isDark,
                'opacity-60': task.status === 'done',
            })}
        >
            <div className="flex items-start gap-2">
                <button
                    onClick={() => onStatusChange(taskId, nextStatus)}
                    className={cn('w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors shrink-0', {
                        'border-green-500 bg-green-500': task.status === 'done',
                        'border-blue-400 bg-blue-400/20': task.status === 'in-progress',
                        'border-gray-400 hover:border-blue-400': task.status === 'todo' && !isDark,
                        'border-gray-600 hover:border-blue-400': task.status === 'todo' && isDark,
                    })}
                    aria-label={`Change status to ${nextStatus}`}
                >
                    {task.status === 'done' && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {task.status === 'in-progress' && <div className="w-2 h-2 bg-blue-400 rounded-full" />}
                </button>
                <div className="flex-1 min-w-0">
                    <p
                        className={cn('text-sm font-medium truncate', {
                            'line-through text-gray-500': task.status === 'done',
                            'text-gray-200': task.status !== 'done' && isDark,
                            'text-gray-700': task.status !== 'done' && !isDark,
                        })}
                    >
                        {task.title}
                    </p>
                    {task.description && (
                        <p className={cn('text-xs mt-0.5 line-clamp-2', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                            {task.description}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => {
                        store?.destroy();
                        onDelete(taskId);
                    }}
                    className={cn('text-xs shrink-0 p-1 rounded transition-colors opacity-0 group-hover:opacity-100', {
                        'text-gray-600 hover:text-red-400 hover:bg-red-500/10': isDark,
                        'text-gray-400 hover:text-red-500 hover:bg-red-50': !isDark,
                    })}
                    aria-label="Delete task"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                    <span className={cn('w-1.5 h-1.5 rounded-full', priority.dotClass)} />
                    <span className={cn('text-[10px]', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>{priority.label}</span>
                </span>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded', isDark ? status.badgeClass : status.badgeClassLight)}>
                    {status.label}
                </span>
                <span className={cn('text-[10px] ml-auto', { 'text-gray-600': isDark, 'text-gray-400': !isDark })}>
                    {formatDate(task.createdAt)}
                </span>
                {task.completedAt && (
                    <span className={cn('text-[10px]', { 'text-green-500': isDark, 'text-green-600': !isDark })}>
                        Done {formatDate(task.completedAt)}
                    </span>
                )}
            </div>
        </div>
    );
};

const CombinedDemo: React.FC = () => {
    const { isDark } = useStoryTheme();

    const [taskIds, setTaskIds] = useState<number[]>(() => {
        const persisted = loadPersistedTasks();
        const ids: number[] = [];
        persisted.forEach((t) => {
            if (t.id > taskIdCounter) taskIdCounter = t.id;
            const store = taskFactory.create(t);
            ids.push(store.id);
        });
        return ids;
    });

    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
    const [titleError, setTitleError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const persistAll = useCallback(() => {
        const list = taskFactory.list({ itemsPerPage: 1000 });
        persistAllTasks(list.items);
    }, []);

    const allTasks = useMemo(() => {
        void refreshKey;
        const list = taskFactory.list({ itemsPerPage: 1000 });
        return list.items;
    }, [taskIds, refreshKey]);

    const filteredTaskIds = useMemo(() => {
        if (filterStatus === 'all') return taskIds;
        return taskIds.filter((id) => {
            const store = taskFactory.get(id);
            if (!store) return false;
            return store.getState().status === filterStatus;
        });
    }, [taskIds, filterStatus, refreshKey]);

    const statusCounts = useMemo(() => {
        const counts = { todo: 0, 'in-progress': 0, done: 0 };
        allTasks.forEach((t) => {
            counts[t.status]++;
        });
        return counts;
    }, [allTasks]);

    const completionPercent = useMemo(() => {
        if (allTasks.length === 0) return 0;
        return Math.round((statusCounts.done / allTasks.length) * 100);
    }, [allTasks.length, statusCounts.done]);

    const handleAdd = useCallback(() => {
        if (!newTitle.trim()) {
            setTitleError('Title is required');
            return;
        }
        if (newTitle.trim().length < 3) {
            setTitleError('Title must be at least 3 characters');
            return;
        }
        setTitleError('');
        const store = taskFactory.create({
            title: newTitle.trim(),
            description: newDescription.trim(),
            priority: newPriority,
        });
        setTaskIds((prev) => [...prev, store.id]);
        setNewTitle('');
        setNewDescription('');
        setNewPriority('medium');
        setTimeout(persistAll, 100);
    }, [newTitle, newDescription, newPriority, persistAll]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) handleAdd();
    };

    const handleDelete = useCallback(
        (id: number) => {
            setTaskIds((prev) => prev.filter((tid) => tid !== id));
            setRefreshKey((k) => k + 1);
            setTimeout(persistAll, 100);
        },
        [persistAll],
    );

    const handleStatusChange = useCallback(
        (id: number, status: TaskStatus) => {
            const store = taskFactory.get(id);
            if (!store) return;
            const updates: Partial<Task> = { status };
            if (status === 'done') {
                updates.completedAt = Date.now();
            } else {
                updates.completedAt = null;
            }
            store.setState(updates);
            setRefreshKey((k) => k + 1);
            setTimeout(persistAll, 100);
        },
        [persistAll],
    );

    const handleClearCompleted = useCallback(() => {
        const doneIds = taskIds.filter((id) => {
            const store = taskFactory.get(id);
            return store?.getState().status === 'done';
        });
        doneIds.forEach((id) => {
            taskFactory.get(id)?.destroy();
        });
        setTaskIds((prev) => prev.filter((id) => !doneIds.includes(id)));
        setRefreshKey((k) => k + 1);
        setTimeout(persistAll, 100);
    }, [taskIds, persistAll]);

    const handleClearAll = useCallback(() => {
        taskIds.forEach((id) => taskFactory.get(id)?.destroy());
        setTaskIds([]);
        setRefreshKey((k) => k + 1);
        localStorage.removeItem(combinedPersistKey);
    }, [taskIds]);

    return (
        <>
            <ComponentDemo
                title="Task Manager"
                description="Realistic composite example: CRUD, validation, persistence, list management, and status tracking"
                centered={false}
            >
                <div className="w-full max-w-2xl mx-auto p-4">
                    <div
                        className={cn('rounded-lg border p-4 mb-4', {
                            'border-white/10 bg-white/5': isDark,
                            'border-gray-200 bg-gray-50': !isDark,
                        })}
                    >
                        <p className={cn('text-xs font-semibold mb-3', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>New Task</p>
                        <div className="space-y-2">
                            <div>
                                <TextInput
                                    value={newTitle}
                                    onChange={(e) => {
                                        setNewTitle(e.value);
                                        if (titleError) setTitleError('');
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Task title..."
                                    borderColor={titleError ? '#ef4444' : undefined}
                                />
                                {titleError && <p className="text-red-400 text-xs mt-1">{titleError}</p>}
                            </div>
                            <TextArea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.value)}
                                placeholder="Description (optional)"
                                rows={2}
                            />
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <span className={cn('text-xs', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>Priority:</span>
                                    <Dropdown
                                        options={priorityOptions}
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.value as TaskPriority)}
                                        size="sm"
                                    />
                                </div>
                                <Button label="Add Task" size="sm" className="ml-auto" onClick={handleAdd} />
                            </div>
                        </div>
                    </div>

                    {allTasks.length > 0 && (
                        <div
                            className={cn('rounded-lg border p-3 mb-4', {
                                'border-white/10 bg-white/5': isDark,
                                'border-gray-200 bg-gray-50': !isDark,
                            })}
                        >
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex-1 min-w-[120px]">
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className={cn('text-[11px] font-medium', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}
                                        >
                                            Progress
                                        </span>
                                        <span
                                            className={cn('text-[11px] font-bold tabular-nums', {
                                                'text-gray-300': isDark,
                                                'text-gray-600': !isDark,
                                            })}
                                        >
                                            {completionPercent}%
                                        </span>
                                    </div>
                                    <div
                                        className={cn('h-2 rounded-full overflow-hidden', {
                                            'bg-white/10': isDark,
                                            'bg-gray-200': !isDark,
                                        })}
                                    >
                                        <div
                                            className="h-full rounded-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${completionPercent}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 text-[11px]">
                                    <span className={cn({ 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                                        <span className="font-bold">{statusCounts.todo}</span> to do
                                    </span>
                                    <span className={cn({ 'text-blue-400': isDark, 'text-blue-500': !isDark })}>
                                        <span className="font-bold">{statusCounts['in-progress']}</span> active
                                    </span>
                                    <span className={cn({ 'text-green-400': isDark, 'text-green-500': !isDark })}>
                                        <span className="font-bold">{statusCounts.done}</span> done
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <SelectButton
                            items={filterItems}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.value as TaskStatus | 'all')}
                            size="sm"
                        />
                        <div className="flex gap-1 ml-auto">
                            {statusCounts.done > 0 && (
                                <Button
                                    label="Clear Completed"
                                    size="xs"
                                    variant="secondary"
                                    layout="plain"
                                    onClick={handleClearCompleted}
                                />
                            )}
                            {allTasks.length > 0 && (
                                <Button label="Clear All" size="xs" variant="danger" layout="plain" onClick={handleClearAll} />
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        {filteredTaskIds.length === 0 && (
                            <div
                                className={cn('text-sm text-center py-8 rounded-lg border border-dashed', {
                                    'text-gray-600 border-white/10': isDark,
                                    'text-gray-400 border-gray-300': !isDark,
                                })}
                            >
                                {taskIds.length === 0
                                    ? 'No tasks yet. Create one above to get started.'
                                    : 'No tasks match the selected filter.'}
                            </div>
                        )}
                        {filteredTaskIds.map((id) => (
                            <TaskCard key={id} taskId={id} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                        ))}
                    </div>

                    {allTasks.length > 0 && (
                        <div className={cn('mt-3 text-[10px] text-center', { 'text-gray-600': isDark, 'text-gray-400': !isDark })}>
                            Tasks are persisted to localStorage. Refresh the page to verify.
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CombinedDemo;
