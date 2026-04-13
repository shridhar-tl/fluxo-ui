import cn from 'classnames';
import React, { useRef } from 'react';
import { Button, InputSwitch, ProgressBar, TextInput } from '../../../components';
import { create, createHook } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface TaskState {
    tasks: { id: number; title: string; done: boolean }[];
    nextId: number;
    filter: 'all' | 'active' | 'done';
}

interface NotificationState {
    items: { id: number; message: string; type: 'info' | 'success' | 'warning' }[];
    nextId: number;
    muted: boolean;
}

const taskStore = create<TaskState>(() => ({
    tasks: [
        { id: 1, title: 'Set up project', done: true },
        { id: 2, title: 'Build components', done: false },
        { id: 3, title: 'Write tests', done: false },
    ],
    nextId: 4,
    filter: 'all',
}));

taskStore.compute('completedCount', (s) => s.tasks.filter((t) => t.done).length, ['tasks']);
taskStore.compute('activeCount', (s) => s.tasks.filter((t) => !t.done).length, ['tasks']);
taskStore.compute('progress', (s) => (s.tasks.length > 0 ? Math.round((s.tasks.filter((t) => t.done).length / s.tasks.length) * 100) : 0), [
    'tasks',
]);

const useTaskStore = createHook(taskStore);

const notificationStore = create<NotificationState>(() => ({
    items: [],
    nextId: 1,
    muted: false,
}));

const useNotificationStore = createHook(notificationStore);

const notificationMessages: { message: string; type: 'info' | 'success' | 'warning' }[] = [
    { message: 'New deployment started', type: 'info' },
    { message: 'Build succeeded', type: 'success' },
    { message: 'Disk usage above 80%', type: 'warning' },
    { message: 'User signed up', type: 'info' },
    { message: 'Payment processed', type: 'success' },
    { message: 'API rate limit approaching', type: 'warning' },
];

const addRandomNotification = () => {
    const state = notificationStore.getState();
    if (state.muted) return;
    const template = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
    notificationStore.setState((s) => ({
        items: [...s.items.slice(-9), { id: s.nextId, ...template }],
        nextId: s.nextId + 1,
    }));
};

const code = `import { create, createHook } from 'fluxo-ui/store';

// Store A — Task management
const taskStore = create<TaskState>(() => ({
  tasks: [{ id: 1, title: 'Build components', done: false }],
  nextId: 2,
  filter: 'all',
}));
taskStore.compute('completedCount', (s) => s.tasks.filter(t => t.done).length, ['tasks']);
taskStore.compute('progress', (s) => {
  const done = s.tasks.filter(t => t.done).length;
  return s.tasks.length ? Math.round((done / s.tasks.length) * 100) : 0;
}, ['tasks']);
const useTaskStore = createHook(taskStore);

// Store B — Notification feed
const notificationStore = create<NotificationState>(() => ({
  items: [],
  nextId: 1,
  muted: false,
}));
const useNotificationStore = createHook(notificationStore);

// Each store is fully independent — updating one never triggers
// re-renders in components that only subscribe to the other.
function TaskPanel() {
  const { tasks, filter } = useTaskStore();
  // Only re-renders when taskStore changes
}

function NotificationFeed() {
  const { items, muted } = useNotificationStore();
  // Only re-renders when notificationStore changes
}`;

const typeColors = {
    info: { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400', lightBg: 'bg-blue-50', lightText: 'text-blue-700' },
    success: {
        dot: 'bg-emerald-500',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        lightBg: 'bg-emerald-50',
        lightText: 'text-emerald-700',
    },
    warning: { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', lightBg: 'bg-amber-50', lightText: 'text-amber-700' },
};

const TaskPanel: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;
    const newTaskRef = useRef('');

    const state = useTaskStore();
    const tasks = state.tasks;
    const filter = state.filter;
    const completedCount = (state as any).completedCount as number;
    const activeCount = (state as any).activeCount as number;
    const progress = (state as any).progress as number;

    const filtered = filter === 'all' ? tasks : tasks.filter((t) => (filter === 'done' ? t.done : !t.done));

    const addTask = () => {
        const title = newTaskRef.current.trim();
        if (!title) return;
        taskStore.setState((s) => ({
            tasks: [...s.tasks, { id: s.nextId, title, done: false }],
            nextId: s.nextId + 1,
        }));
        newTaskRef.current = '';
    };

    const toggleTask = (id: number) => {
        taskStore.setState((s) => ({
            tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        }));
    };

    const removeTask = (id: number) => {
        taskStore.setState((s) => ({
            tasks: s.tasks.filter((t) => t.id !== id),
        }));
    };

    const setFilter = (f: 'all' | 'active' | 'done') => {
        taskStore.setState({ filter: f });
    };

    return (
        <div
            className={cn('rounded-xl border p-5 flex flex-col', {
                'border-white/10 bg-white/[0.03]': isDark,
                'border-gray-200 bg-white': !isDark,
            })}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full', { 'bg-blue-500': true })} />
                    <span
                        className={cn('text-sm font-semibold uppercase tracking-wide', {
                            'text-gray-400': isDark,
                            'text-gray-500': !isDark,
                        })}
                    >
                        Task Store
                    </span>
                </div>
                <div
                    className={cn('text-xs px-2 py-0.5 rounded', {
                        'bg-amber-500/20 text-amber-400': isDark,
                        'bg-amber-100 text-amber-700': !isDark,
                    })}
                >
                    Renders: {renderCount.current}
                </div>
            </div>

            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className={cn('text-xs', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                        {completedCount} of {tasks.length} completed
                    </span>
                    <span className={cn('text-xs font-medium', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>{progress}%</span>
                </div>
                <ProgressBar value={progress} size="sm" />
            </div>

            <div className="flex gap-1 mb-3">
                {(['all', 'active', 'done'] as const).map((f) => (
                    <Button
                        key={f}
                        label={`${f.charAt(0).toUpperCase() + f.slice(1)}${f === 'active' ? ` (${activeCount})` : f === 'done' ? ` (${completedCount})` : ''}`}
                        size="xs"
                        variant={filter === f ? 'primary' : 'secondary'}
                        layout={filter === f ? 'default' : 'plain'}
                        onClick={() => setFilter(f)}
                    />
                ))}
            </div>

            <div className={cn('space-y-1.5 mb-3 max-h-44 overflow-y-auto flex-1', { 'min-h-[80px]': true })}>
                {filtered.length === 0 && (
                    <div className={cn('text-xs italic text-center py-4', { 'text-gray-600': isDark, 'text-gray-400': !isDark })}>
                        No {filter === 'all' ? '' : filter} tasks
                    </div>
                )}
                {filtered.map((task) => (
                    <div
                        key={task.id}
                        className={cn('flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm group', {
                            'bg-white/5 hover:bg-white/10': isDark,
                            'bg-gray-50 hover:bg-gray-100': !isDark,
                        })}
                    >
                        <button
                            className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors', {
                                'border-[var(--eui-primary)] bg-[var(--eui-primary)]': task.done,
                                'border-gray-400': !task.done && !isDark,
                                'border-gray-600': !task.done && isDark,
                            })}
                            onClick={() => toggleTask(task.id)}
                            aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
                        >
                            {task.done && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                        <span
                            className={cn('flex-1', {
                                'line-through opacity-50': task.done,
                                'text-gray-300': isDark && !task.done,
                                'text-gray-700': !isDark && !task.done,
                            })}
                        >
                            {task.title}
                        </span>
                        <button
                            className={cn('opacity-0 group-hover:opacity-100 text-xs transition-opacity', {
                                'text-red-400 hover:text-red-300': isDark,
                                'text-red-500 hover:text-red-700': !isDark,
                            })}
                            onClick={() => removeTask(task.id)}
                            aria-label="Remove task"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <div className="flex-1">
                    <TextInput
                        placeholder="Add a task..."
                        size="sm"
                        onChange={(e) => {
                            newTaskRef.current = e.value;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') addTask();
                        }}
                    />
                </div>
                <Button label="Add" size="sm" onClick={addTask} />
            </div>
        </div>
    );
};

const NotificationFeed: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;

    const { items, muted } = useNotificationStore();

    return (
        <div
            className={cn('rounded-xl border p-5 flex flex-col', {
                'border-white/10 bg-white/[0.03]': isDark,
                'border-gray-200 bg-white': !isDark,
            })}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full', { 'bg-emerald-500': true })} />
                    <span
                        className={cn('text-sm font-semibold uppercase tracking-wide', {
                            'text-gray-400': isDark,
                            'text-gray-500': !isDark,
                        })}
                    >
                        Notification Store
                    </span>
                </div>
                <div
                    className={cn('text-xs px-2 py-0.5 rounded', {
                        'bg-amber-500/20 text-amber-400': isDark,
                        'bg-amber-100 text-amber-700': !isDark,
                    })}
                >
                    Renders: {renderCount.current}
                </div>
            </div>

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={cn('text-xs', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>Muted</span>
                    <InputSwitch checked={muted} onChange={() => notificationStore.setState((s) => ({ muted: !s.muted }))} size="sm" />
                </div>
                <div className="flex gap-2">
                    <Button label="Add Random" size="xs" onClick={addRandomNotification} disabled={muted} />
                    <Button
                        label="Clear All"
                        size="xs"
                        variant="secondary"
                        layout="plain"
                        onClick={() => notificationStore.setState({ items: [] })}
                    />
                </div>
            </div>

            <div className={cn('space-y-1.5 max-h-52 overflow-y-auto flex-1', { 'min-h-[80px]': true })}>
                {items.length === 0 && (
                    <div className={cn('text-xs italic text-center py-4', { 'text-gray-600': isDark, 'text-gray-400': !isDark })}>
                        {muted ? 'Notifications are muted' : 'No notifications yet'}
                    </div>
                )}
                {[...items].reverse().map((item) => {
                    const colors = typeColors[item.type];
                    return (
                        <div
                            key={item.id}
                            className={cn('flex items-start gap-2 px-2.5 py-2 rounded-md text-xs group', {
                                [colors.bg]: isDark,
                                [colors.lightBg]: !isDark,
                            })}
                        >
                            <div className={cn('w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0', colors.dot)} />
                            <span className={cn('flex-1', { [colors.text]: isDark, [colors.lightText]: !isDark })}>{item.message}</span>
                            <button
                                className={cn('opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0', {
                                    'text-gray-500 hover:text-gray-300': isDark,
                                    'text-gray-400 hover:text-gray-600': !isDark,
                                })}
                                onClick={() => notificationStore.setState((s) => ({ items: s.items.filter((n) => n.id !== item.id) }))}
                                aria-label="Dismiss notification"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CrossStoreActions: React.FC = () => {
    const { isDark } = useStoryTheme();

    const completeAllAndNotify = () => {
        const state = taskStore.getState();
        const pendingCount = state.tasks.filter((t) => !t.done).length;
        if (pendingCount === 0) return;
        taskStore.setState((s) => ({
            tasks: s.tasks.map((t) => ({ ...t, done: true })),
        }));
        if (!notificationStore.getState().muted) {
            notificationStore.setState((s) => ({
                items: [...s.items, { id: s.nextId, message: `Completed ${pendingCount} remaining tasks`, type: 'success' as const }],
                nextId: s.nextId + 1,
            }));
        }
    };

    const resetBoth = () => {
        taskStore.reset();
        notificationStore.reset();
    };

    return (
        <div
            className={cn('rounded-lg p-3 border border-dashed flex items-center justify-between', {
                'border-white/10 bg-white/[0.02]': isDark,
                'border-gray-300 bg-gray-50': !isDark,
            })}
        >
            <span className={cn('text-xs', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                Cross-store actions (updates both stores independently)
            </span>
            <div className="flex gap-2">
                <Button label="Complete All + Notify" size="xs" onClick={completeAllAndNotify} />
                <Button label="Reset Both" size="xs" variant="secondary" onClick={resetBoth} />
            </div>
        </div>
    );
};

const MultipleStores: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Multiple Independent Stores"
                description="Two separate stores (tasks + notifications) coexist in one component tree. Each store has its own hook — updating one never causes re-renders in components subscribed to the other. Watch the render counts to verify isolation."
                centered={false}
            >
                <div className="p-6 flex flex-col gap-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <TaskPanel />
                        <NotificationFeed />
                    </div>
                    <CrossStoreActions />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default MultipleStores;
