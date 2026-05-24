import React, { useState } from 'react';

import type { EditorState } from '../../../components';
import { ImageEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sampleImage = 'https://picsum.photos/seed/fluxo-persist/800/600';

const code = `import { ImageEditor, type EditorState } from 'fluxo-ui';

function Editor() {
  // Treat editState like a controlled input value: store what onEditStateChange
  // gives you, then pass it back as editState to reopen with the same edits.
  const [editState, setEditState] = useState<EditorState | null>(null);

  return (
    <ImageEditor
      src="https://picsum.photos/seed/fluxo-persist/800/600"
      editState={editState}
      onEditStateChange={setEditState}
    />
  );
}`;

const PersistedEdits: React.FC = () => {
    const [editState, setEditState] = useState<EditorState | null>(null);
    const [mounted, setMounted] = useState(true);

    return (
        <>
            <ComponentDemo
                title="Persisted Edits"
                description="Crop and annotate, then close and reopen the editor — the edits return as live, movable layers because the editor state is saved and restored."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ width: '100%', height: 500 }}>
                        {mounted ? (
                            <ImageEditor
                                src={sampleImage}
                                alt="Persisted edits demo"
                                editState={editState}
                                onEditStateChange={setEditState}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px dashed var(--eui-border-subtle)',
                                    borderRadius: 6,
                                    color: 'var(--eui-text-muted)',
                                }}
                            >
                                Editor closed — reopen to restore your edits.
                            </div>
                        )}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
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
                            onClick={() => setMounted((m) => !m)}
                            style={{ cursor: 'pointer' }}
                            className="eui-image-editor-action-btn"
                        >
                            {mounted ? 'Close editor' : 'Reopen editor'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditState(null)}
                            style={{ cursor: 'pointer' }}
                            className="eui-image-editor-action-btn"
                        >
                            Clear saved state
                        </button>
                        <span style={{ color: 'var(--eui-text-muted)' }}>
                            Saved edit state: <strong>{editState ? 'present' : 'none'}</strong>
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

export default PersistedEdits;
