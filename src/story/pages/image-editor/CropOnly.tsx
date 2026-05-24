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
  tools={['crop']}
  defaultTool="crop"
  cropModes={['custom', 'square', '16:9', '4:3', '1:1']}
  editState={editState}
  onEditStateChange={setEditState}
/>`;

const CropOnly: React.FC = () => {
    const [editState, setEditState] = useState<EditorState | null>(null);

    return (
        <>
            <ComponentDemo title="Crop Only" description="Editor restricted to crop tool with predefined aspect ratios.">
                <div className="w-full" style={{ height: 500 }}>
                    <ImageEditor
                        src={sampleImage}
                        alt="Crop demo"
                        tools={['crop']}
                        defaultTool="crop"
                        cropModes={['custom', 'square', '16:9', '4:3', '1:1']}
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

export default CropOnly;
