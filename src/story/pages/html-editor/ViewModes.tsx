import React, { useState } from 'react';
import { HtmlEditor, type EditorViewMode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const initial = `<h1>View Modes</h1>
<p>Switch between <strong>Edit</strong>, <em>Split</em>, and <strong>Preview</strong> from the top-right toolbar.</p>
<h2>Sample content</h2>
<p>Inline: <strong>bold</strong>, <em>italic</em>, <s>strike</s>, <code>inline code</code>, and a <a href="https://fluxo-ui.utilsware.com/">link</a>.</p>
<ul>
    <li>Edit-only hides the preview pane</li>
    <li>Split shows both side-by-side (tabs on mobile)</li>
    <li>Preview hides the editor entirely</li>
</ul>
<blockquote><p>Each view can be controlled externally via the <code>view</code> prop.</p></blockquote>`;

const code = `const [view, setView] = useState<EditorViewMode>('split');

<HtmlEditor
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
                    <HtmlEditor value={value} onChange={setValue} view={view} onViewChange={setView} maxHeight={460} />
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
