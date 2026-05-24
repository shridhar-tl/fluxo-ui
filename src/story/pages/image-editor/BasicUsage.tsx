import React, { useState } from 'react';
import type { EditorState } from '../../../components';
import { ImageEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sampleImage = 'https://picsum.photos/seed/fluxo/800/600';

const code = `import { ImageEditor, type EditorState } from 'fluxo-ui';

function Editor() {
  const [editState, setEditState] = useState<EditorState | null>(null);

  const download = () => {
    if (!editState) return;
    const a = document.createElement('a');
    a.href = editState.flattened;
    a.download = 'edited-image.png';
    a.click();
  };

  return (
    <>
      <ImageEditor
        src="https://picsum.photos/seed/fluxo/800/600"
        alt="Sample landscape"
        editState={editState}
        onEditStateChange={setEditState}
      />
      <button onClick={download}>Download</button>
    </>
  );
}`;

const BasicUsage: React.FC = () => {
    const [editState, setEditState] = useState<EditorState | null>(null);

    const download = () => {
        if (!editState) return;
        const a = document.createElement('a');
        a.href = editState.flattened;
        a.download = 'edited-image.png';
        a.click();
    };

    return (
        <>
            <ComponentDemo
                title="Full Editor"
                description="Image editor with all tools enabled. Edits are emitted through onEditStateChange; the consumer decides what to do with the result."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ width: '100%', height: 500 }}>
                        <ImageEditor
                            src={sampleImage}
                            alt="Sample landscape"
                            editState={editState}
                            onEditStateChange={setEditState}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                        }}
                    >
                        <button
                            type="button"
                            onClick={download}
                            disabled={!editState}
                            className="eui-image-editor-action-btn"
                            style={{ cursor: editState ? 'pointer' : 'not-allowed' }}
                        >
                            Download result
                        </button>
                        <span style={{ color: 'var(--eui-text-muted)' }}>
                            Edits captured: <strong>{editState ? 'yes' : 'none'}</strong>
                        </span>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
