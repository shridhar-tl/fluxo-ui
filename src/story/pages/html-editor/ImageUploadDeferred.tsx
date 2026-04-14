import React, { useCallback, useRef, useState } from 'react';
import { Button, HtmlEditor, type HtmlEditorHandle } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const initial = `<h1>Deferred Upload (Flush on Submit)</h1>
<p>Drop or paste images — they appear instantly via local <code>blob:</code> URLs. When you click <strong>Submit</strong>, the editor flushes all pending uploads via <code>flushUploads()</code> and replaces the blob URLs with the real ones.</p>
<h2>Workflow</h2>
<ol>
    <li>Drop or paste any <strong>image</strong> into the editor</li>
    <li>Keep editing — images show up immediately</li>
    <li>Click <strong>Submit</strong> to run all uploads and get the final HTML</li>
</ol>
<p><img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800" alt="Pre-uploaded image" /></p>
<blockquote><p>Use this strategy when you don't want to upload until the user actually commits their content.</p></blockquote>`;

const code = `const editorRef = useRef<HtmlEditorHandle>(null);

<HtmlEditor
  ref={editorRef}
  value={value}
  onChange={setValue}
  uploadStrategy="deferred"
  uploadImage={async (file) => await myUploader(file)}
/>

<Button
  onClick={async () => {
    const finalHtml = await editorRef.current?.flushUploads();
    submitForm(finalHtml);
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
    const editorRef = useRef<HtmlEditorHandle>(null);

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
                    <HtmlEditor
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
