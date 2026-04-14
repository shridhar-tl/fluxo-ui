import React, { useCallback, useRef, useState } from 'react';
import { MarkdownEditor, type MarkdownEditorHandle } from '../../../components';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const initial = `# Deferred Upload (Flush on Submit)

Drop or paste images — they appear instantly via local \`blob:\` URLs.
When you click **Submit**, the editor flushes all pending uploads via \`flushUploads()\` and replaces the blob URLs with the real ones.

## Workflow

1. Drop or paste any **image** into the editor
2. Keep editing — images show up immediately
3. Click **Submit** to run all uploads and get the final markdown

![Pre-uploaded image](https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800)

> Use this strategy when you don't want to upload until the user actually commits their content.

\`\`\`ts
const final = await editorRef.current.flushUploads();
await api.save(final);
\`\`\`

| Field     | Stored as       |
| --------- | --------------- |
| Drafts    | \`blob:\` URLs  |
| Submitted | \`https://\` URL |
`;

const code = `const editorRef = useRef<MarkdownEditorHandle>(null);

<MarkdownEditor
  ref={editorRef}
  value={value}
  onChange={setValue}
  uploadStrategy="deferred"
  uploadImage={async (file) => {
    return await myUploader(file);
  }}
/>

<Button
  onClick={async () => {
    const finalMarkdown = await editorRef.current?.flushUploads();
    submitForm(finalMarkdown);
  }}
>
  Submit
</Button>`;

const fakeUpload = async (file: File): Promise<string> => {
    await new Promise((r) => setTimeout(r, 800));
    return 'https://cdn.utilsware.com/uploads/' + encodeURIComponent(file.name);
};

const ImageUploadDeferred: React.FC = () => {
    const [value, setValue] = useState(initial);
    const [submitted, setSubmitted] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const editorRef = useRef<MarkdownEditorHandle>(null);

    const handleSubmit = useCallback(async () => {
        if (!editorRef.current) return;
        setBusy(true);
        try {
            const final = await editorRef.current.flushUploads();
            setSubmitted(final);
        } finally {
            setBusy(false);
        }
    }, []);

    return (
        <>
            <ComponentDemo title="Deferred Upload Strategy" description="Images are inserted as blob URLs immediately for instant preview, then uploaded only when you flush.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <MarkdownEditor
                        ref={editorRef}
                        value={value}
                        onChange={setValue}
                        uploadStrategy="deferred"
                        uploadImage={fakeUpload}
                        maxImageSize={5 * 1024 * 1024}
                        maxHeight={460}
                    />
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                        }}
                    >
                        <Button onClick={handleSubmit} disabled={busy}>
                            {busy ? 'Uploading...' : 'Submit'}
                        </Button>
                    </div>
                    {submitted && (
                        <pre
                            style={{
                                margin: 0,
                                padding: 14,
                                background: 'var(--eui-bg-subtle)',
                                border: '1px solid var(--eui-border-subtle)',
                                borderRadius: 6,
                                fontSize: 12,
                                color: 'var(--eui-text)',
                                whiteSpace: 'pre-wrap',
                                overflow: 'auto',
                                maxHeight: 240,
                            }}
                        >
                            {submitted}
                        </pre>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ImageUploadDeferred;
