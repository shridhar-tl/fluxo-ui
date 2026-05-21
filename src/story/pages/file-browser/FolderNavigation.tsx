import React, { useMemo, useState } from 'react';
import { Breadcrumb, FileBrowser } from '../../../components';
import type { FileBrowserItem } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

interface Node extends FileBrowserItem {
    children?: Node[];
}

const tree: Node[] = [
    {
        id: 'photos',
        name: 'Photos',
        kind: 'folder',
        children: [
            { id: 'p1', name: 'beach.jpg', kind: 'image', thumbnailUrl: 'https://picsum.photos/seed/fb-n1/240/180', size: 320000 },
            { id: 'p2', name: 'forest.jpg', kind: 'image', thumbnailUrl: 'https://picsum.photos/seed/fb-n2/240/180', size: 280000 },
        ],
    },
    {
        id: 'docs',
        name: 'Documents',
        kind: 'folder',
        children: [
            { id: 'd1', name: 'invoice.pdf', kind: 'pdf', size: 90000 },
            { id: 'd2', name: 'notes.txt', kind: 'text', size: 2048 },
        ],
    },
    { id: 'r1', name: 'readme.md', kind: 'text', size: 1024 },
];

const code = `const [path, setPath] = useState<string[]>([]);

<FileBrowser
    view="details"
    items={currentItems}
    toolbarStart={<Breadcrumb items={crumbs} onItemClick={navigate} />}
    onItemOpen={(item) => {
        if (item.kind === 'folder') setPath((p) => [...p, item.id]);
    }}
/>`;

function findChildren(path: string[]): Node[] {
    let level = tree;
    for (const id of path) {
        const next = level.find((n) => n.id === id)?.children;
        if (!next) return [];
        level = next;
    }
    return level;
}

const FolderNavigation: React.FC = () => {
    const [path, setPath] = useState<string[]>([]);
    const items = useMemo(() => findChildren(path), [path]);

    const crumbs = useMemo(() => {
        const out = [{ label: 'Home', value: '' }];
        let level = tree;
        for (const id of path) {
            const node = level.find((n) => n.id === id);
            if (!node) break;
            out.push({ label: node.name, value: id });
            level = node.children ?? [];
        }
        return out;
    }, [path]);

    return (
        <>
            <ComponentDemo
                title="Folder navigation"
                description="Open a folder with Enter or double-click to drill in; the breadcrumb in the toolbar walks back out. The same pattern powers Google Drive / OneDrive style explorers."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FileBrowser
                        view="details"
                        items={items}
                        ariaLabel="Folder contents"
                        selectable={false}
                        emptyState={<span style={{ color: 'var(--eui-text-muted)' }}>This folder is empty</span>}
                        toolbarStart={
                            <Breadcrumb
                                items={crumbs.map((c) => ({ label: c.label }))}
                                onItemClick={(_item, index) => setPath(path.slice(0, index))}
                            />
                        }
                        onItemOpen={(item) => {
                            if (item.kind === 'folder') setPath((p) => [...p, item.id]);
                        }}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default FolderNavigation;
