import React, { useState } from 'react';
import { MarkdownEditor, type EditorViewMode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const initial = `# View Modes

Switch between **Edit**, *Split*, and **Preview** from the top-right toolbar.

## Sample content

Inline: **bold**, *italic*, ~~strike~~, \`inline code\`, and a [link](https://fluxo-ui.utilsware.com/).

![Forest](https://images.unsplash.com/photo-1448375240586-882707db888b?w=800)

- Edit-only hides the preview pane
- Split shows both side-by-side (tabs on mobile)
- Preview hides the editor entirely

1. Try the **Edit** button
2. Try **Split**
3. Try **Preview**

> Each view can be controlled externally via the \`view\` prop.

\`\`\`tsx
<MarkdownEditor view={view} onViewChange={setView} />
\`\`\`

| Mode    | Editor | Preview |
| ------- | :----: | :-----: |
| edit    |  yes   |   no    |
| split   |  yes   |   yes   |
| preview |   no   |   yes   |
`;

const code = `const [view, setView] = useState<EditorViewMode>('split');

<MarkdownEditor
  value={value}
  onChange={setValue}
  view={view}
  onViewChange={setView}
/>`;

const ViewModes: React.FC = () => {
    const [value, setValue] = useState(initial);
    const [view, setView] = useState<EditorViewMode>('split');
    return (
        <>
            <ComponentDemo title="Edit / Split / Preview" description="Fully controlled view mode — wire it to your own UI if you want external toggles.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <MarkdownEditor value={value} onChange={setValue} view={view} onViewChange={setView} maxHeight={460} />
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                            color: 'var(--eui-text-muted)',
                        }}
                    >
                        Current view: <strong style={{ color: 'var(--eui-text)' }}>{view}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ViewModes;
