import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { Button, TextInput } from '../../../components';
import { createItemHook, createModel } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

let nextTodoId = 1;

const todoFactory = createModel<Todo>({
    nextId: () => nextTodoId++,
    createWithDefaults: (id) => ({
        id,
        title: '',
        completed: false,
    }),
    selectId: (state) => state.id,
});

const code = `import { createModel, createItemHook } from 'fluxo-ui/store';

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

let nextTodoId = 1;

const todoFactory = createModel<Todo>({
    nextId: () => nextTodoId++,
    createWithDefaults: (id) => ({
        id, title: '', completed: false,
    }),
    selectId: (state) => state.id,
});

// Create a new todo
const store = todoFactory.create({ title: 'My Task' });

// Read state
const state = store.getState(); // { id: 1, title: 'My Task', completed: false }

// Update state
store.setState({ completed: true });

// Delete / destroy
store.destroy();

// React hook for a single item
const useItem = createItemHook(store);
function TodoItem() {
    const todo = useItem();
    return <span>{todo.title}</span>;
}`;

interface TodoItemProps {
    todoId: number;
    onDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todoId, onDelete }) => {
    const { isDark } = useStoryTheme();
    const store = todoFactory.get(todoId);
    const useItem = useMemo(() => (store ? createItemHook(store) : null), [store]);
    const todo = useItem?.() as
        | (Todo & { id: number; isStale: boolean; isLoading: boolean; isSaving: boolean; isDeleting: boolean })
        | undefined;

    const handleToggle = useCallback(() => {
        store?.setState({ completed: !todo?.completed });
    }, [store, todo?.completed]);

    if (!todo) return null;

    return (
        <div
            className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border transition-all', {
                'border-white/10 bg-white/5': isDark,
                'border-gray-200 bg-white': !isDark,
            })}
        >
            <button
                onClick={handleToggle}
                className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0', {
                    'border-green-500 bg-green-500': todo.completed,
                    'border-gray-400 hover:border-blue-400': !todo.completed && !isDark,
                    'border-gray-600 hover:border-blue-400': !todo.completed && isDark,
                })}
                aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
            >
                {todo.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>
            <span
                className={cn('flex-1 text-sm', {
                    'line-through text-gray-500': todo.completed,
                    'text-gray-200': !todo.completed && isDark,
                    'text-gray-700': !todo.completed && !isDark,
                })}
            >
                {todo.title}
            </span>
            <Button
                label="Delete"
                size="xs"
                variant="danger"
                layout="plain"
                onClick={() => {
                    store?.destroy();
                    onDelete(todoId);
                }}
            />
        </div>
    );
};

const BasicCRUD: React.FC = () => {
    const [todoIds, setTodoIds] = useState<number[]>([]);
    const [newTitle, setNewTitle] = useState('');

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        const store = todoFactory.create({ title: newTitle.trim() });
        setTodoIds((prev) => [...prev, store.id]);
        setNewTitle('');
    };

    const handleDelete = (id: number) => {
        setTodoIds((prev) => prev.filter((tid) => tid !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd();
    };

    return (
        <>
            <ComponentDemo
                title="Basic CRUD Operations"
                description="Create, read, update, and delete todos using createModel"
                centered={false}
            >
                <div className="w-full max-w-lg mx-auto p-4">
                    <div className="flex gap-2 mb-4">
                        <TextInput
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a new todo..."
                            className="flex-1"
                        />
                        <Button label="Add" size="sm" onClick={handleAdd} />
                    </div>
                    <div className="space-y-2">
                        {todoIds.length === 0 && <p className="text-sm text-center py-6 text-gray-400">No todos yet. Add one above.</p>}
                        {todoIds.map((id) => (
                            <TodoItem key={id} todoId={id} onDelete={handleDelete} />
                        ))}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicCRUD;
