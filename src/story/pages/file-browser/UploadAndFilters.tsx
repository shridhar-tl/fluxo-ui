import React, { useState } from 'react';
import { FileBrowser } from '../../../components';
import type { FileBrowserItem, RejectedFile } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { FileBrowser } from 'fluxo-ui';
import type { FileBrowserItem, RejectedFile } from 'fluxo-ui';

<FileBrowser
    items={items}
    enableUpload
    multiple
    accept="image/*,.pdf"
    maxFileSize={5 * 1024 * 1024}
    maxSelection={8}
    uploadHint="Drop images or PDFs (max 5 MB)"
    onUpload={(accepted, rejected) => {
        addFiles(accepted);
        rejected.forEach((r) => console.warn(r.file.name, 'rejected:', r.reason));
    }}
/>`;

const UploadAndFilters: React.FC = () => {
    const [items, setItems] = useState<FileBrowserItem[]>([]);
    const [log, setLog] = useState<string>('Drop or pick files (images / PDFs, max 5 MB, up to 8).');

    const onUpload = (accepted: File[], rejected: RejectedFile[]) => {
        const next = accepted.map<FileBrowserItem>((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            mimeType: file.type,
            size: file.size,
            thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            previewUrl: file.type.startsWith('video/') ? URL.createObjectURL(file) : undefined,
        }));
        setItems((prev) => {
            const existing = new Set(prev.map((p) => p.id));
            return [...prev, ...next.filter((n) => !existing.has(n.id))];
        });
        const parts: string[] = [];
        if (accepted.length) parts.push(`${accepted.length} accepted`);
        if (rejected.length) {
            const reasons = rejected.map((r) => `${r.file.name} (${r.reason})`).join(', ');
            parts.push(`${rejected.length} rejected: ${reasons}`);
        }
        setLog(parts.join(' · ') || 'No files.');
    };

    return (
        <>
            <ComponentDemo
                title="Drag-and-drop upload with type, size and count filters"
                description="Drop files anywhere on the browser, or use the empty-state button. accept, maxFileSize and maxSelection reject files and report why."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FileBrowser
                        items={items}
                        enableUpload
                        multiple
                        accept="image/*,.pdf"
                        maxFileSize={5 * 1024 * 1024}
                        maxSelection={8}
                        uploadHint="Drop images or PDFs (max 5 MB)"
                        onUpload={onUpload}
                        style={{ minHeight: 220 }}
                    />
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            color: 'var(--eui-text)',
                            fontSize: 13,
                        }}
                    >
                        {log}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default UploadAndFilters;
