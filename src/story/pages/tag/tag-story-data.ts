import type { TagVariant } from '../../../components';

export const toneList = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const;

export const variantList: TagVariant[] = ['soft', 'solid', 'outline', 'dashed', 'dot', 'ghost', 'gradient'];

export const frameworkTags = ['React', 'TypeScript', 'Vite', 'Tailwind', 'Node.js', 'GraphQL', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'];

export const customColorTags = [
    { label: 'Design', color: '#7c3aed' },
    { label: 'Marketing', color: '#db2777' },
    { label: 'Research', color: '#0891b2' },
    { label: 'Ops', color: '#ea580c' },
    { label: 'Finance', color: '#65a30d' },
    { label: 'Lemon', color: '#facc15' },
];

export const gradients = [
    { label: 'Sunset', from: '#f97316', to: '#db2777' },
    { label: 'Ocean', from: '#0ea5e9', to: '#6366f1' },
    { label: 'Forest', from: '#16a34a', to: '#0d9488' },
];

export const people = ['Ava Chen', 'Liam Patel', 'Noah Kim'];
