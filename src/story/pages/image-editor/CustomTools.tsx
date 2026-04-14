import React, { useCallback } from 'react';
import type { ExportFormat } from '../../../components';
import { ImageEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sampleImage = 'https://picsum.photos/seed/fluxo/800/600';

const code = `import { ImageEditor } from 'fluxo-ui';

<ImageEditor
  src="https://picsum.photos/seed/fluxo/800/600"
  tools={['crop', 'rotate', 'flip', 'blur']}
  defaultTool="rotate"
  maxHistory={20}
  onSave={handleSave}
  onCancel={handleCancel}
/>`;

const CustomTools: React.FC = () => {
    const handleSave = useCallback((blob: Blob, format: ExportFormat) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom-edited.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

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
                        onSave={handleSave}
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
