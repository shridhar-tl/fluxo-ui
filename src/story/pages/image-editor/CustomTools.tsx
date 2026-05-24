import React, { useState } from 'react';
import type { EditorState } from '../../../components';
import { ImageEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sampleImage = 'https://picsum.photos/seed/fluxo/800/600';

const code = `import { ImageEditor, type EditorState } from 'fluxo-ui';

const [editState, setEditState] = useState<EditorState | null>(null);

<ImageEditor
  src="https://picsum.photos/seed/fluxo/800/600"
  tools={['crop', 'rotate', 'flip', 'blur']}
  defaultTool="rotate"
  maxHistory={20}
  editState={editState}
  onEditStateChange={setEditState}
/>`;

const CustomTools: React.FC = () => {
    const [editState, setEditState] = useState<EditorState | null>(null);

    return (
        <>
            <ComponentDemo
                title="Custom Tool Subset"
                description="Editor with only crop, rotate, flip, and blur tools. Default tool set to rotate."
            >
                <div className="w-full" style={{ height: 500 }}>
                    <ImageEditor
                        src={sampleImage}
                        alt="Custom tools demo"
                        tools={['crop', 'rotate', 'flip', 'blur']}
                        defaultTool="rotate"
                        maxHistory={20}
                        editState={editState}
                        onEditStateChange={setEditState}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CustomTools;
