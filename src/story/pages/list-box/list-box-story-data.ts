import type { ListBoxOption } from '../../../components/ListBox';

export const frameworkOptions: ListBoxOption<string>[] = [
    { id: 1, label: 'React', value: 'react', description: "Meta's UI library" },
    { id: 2, label: 'Vue', value: 'vue', description: 'Progressive framework' },
    { id: 3, label: 'Angular', value: 'angular', description: "Google's framework" },
    { id: 4, label: 'Svelte', value: 'svelte', description: 'Compiler-based UI' },
    { id: 5, label: 'Solid', value: 'solid', description: 'Fine-grained reactivity' },
    { id: 6, label: 'Qwik', value: 'qwik', description: 'Resumable framework' },
];

export const roleOptions: ListBoxOption<string>[] = [
    { id: 1, label: 'Admin', value: 'admin', description: 'Full access' },
    { id: 2, label: 'Editor', value: 'editor', description: 'Can edit content' },
    { id: 3, label: 'Viewer', value: 'viewer', description: 'Read only' },
    { id: 4, label: 'Moderator', value: 'moderator', description: 'Can moderate' },
    { id: 5, label: 'Analyst', value: 'analyst', description: 'Can view reports', disabled: true },
];

export const groupedOptions: ListBoxOption<string>[] = [
    { id: 1, label: 'JavaScript', value: 'js', metadata: { category: 'Frontend' } },
    { id: 2, label: 'TypeScript', value: 'ts', metadata: { category: 'Frontend' } },
    { id: 3, label: 'CSS', value: 'css', metadata: { category: 'Frontend' } },
    { id: 4, label: 'Python', value: 'python', metadata: { category: 'Backend' } },
    { id: 5, label: 'Go', value: 'go', metadata: { category: 'Backend' } },
    { id: 6, label: 'Rust', value: 'rust', metadata: { category: 'Backend' } },
    { id: 7, label: 'PostgreSQL', value: 'postgres', metadata: { category: 'Database' } },
    { id: 8, label: 'MongoDB', value: 'mongo', metadata: { category: 'Database' } },
];
