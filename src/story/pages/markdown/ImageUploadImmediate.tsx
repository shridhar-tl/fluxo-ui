import React, { useCallback, useState } from 'react';
import { MarkdownEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const initial = `# Immediate Upload

Click the **image** button in the toolbar, or *paste / drop* an image directly into the editor.

The editor calls your \`uploadImage\` callback immediately and inserts the final URL once it resolves.

## Things to try

1. Click the image toolbar button and choose **Upload**
2. Paste an image from your clipboard
3. Drag an image file from your desktop onto the editor

![Existing hosted image](https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800 "A valley at dawn")

> Already-hosted images work too — paste the URL via the **From URL** tab in the image dialog.

| Action      | Works         |
| ----------- | :-----------: |
| Toolbar     | yes           |
| Paste       | yes           |
| Drag & drop | yes           |
`;

const code = `<MarkdownEditor
  value={value}
  onChange={setValue}
  uploadStrategy="immediate"
  uploadImage={async (file) => {
    const url = await myUploader(file);
    return url;
  }}
  maxImageSize={5 * 1024 * 1024}
  acceptedImageTypes={['image/png', 'image/jpeg', 'image/webp']}
/>`;

const fakeUpload = async (file: File): Promise<string> => {
    await new Promise((r) => setTimeout(r, 800));
    return URL.createObjectURL(file);
};

const ImageUploadImmediate: React.FC = () => {
    const [value, setValue] = useState(initial);
    const [log, setLog] = useState<string[]>([]);

    const handleUpload = useCallback(async (file: File) => {
        setLog((prev) => [...prev, 'Uploading ' + file.name + ' (' + (file.size / 1024).toFixed(0) + ' KB)']);
        const url = await fakeUpload(file);
        setLog((prev) => [...prev, 'Uploaded ' + file.name]);
        return url;
    }, []);

    return (
        <>
            <ComponentDemo title="Immediate Upload Strategy" description="Every selected image uploads right away and the final URL is inserted into the markdown.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <MarkdownEditor
                        value={value}
                        onChange={setValue}
                        uploadStrategy="immediate"
                        uploadImage={handleUpload}
                        maxImageSize={5 * 1024 * 1024}
                        acceptedImageTypes={['image/png', 'image/jpeg', 'image/webp', 'image/gif']}
                        onUploadError={(msg) => setLog((prev) => [...prev, 'Error: ' + msg])}
                        maxHeight={480}
                    />
                    {log.length > 0 && (
                        <div
                            style={{
                                padding: 14,
                                background: 'var(--eui-bg-subtle)',
                                border: '1px solid var(--eui-border-subtle)',
                                borderRadius: 6,
                                fontFamily: 'ui-monospace, monospace',
                                fontSize: 12,
                                color: 'var(--eui-text-muted)',
                            }}
                        >
                            {log.slice(-6).map((l, i) => (
                                <div key={i}>{l}</div>
                            ))}
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

export default ImageUploadImmediate;
