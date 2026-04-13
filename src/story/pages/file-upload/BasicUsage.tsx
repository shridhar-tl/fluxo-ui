import React from 'react';
import { FileUpload } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { FileUpload } from 'fluxo-ui';

<FileUpload
  accept="image/*"
  multiple
  maxFileSize={5 * 1024 * 1024}
  maxFiles={5}
  showPreview
  onFilesSelect={(files) => console.log('Selected:', files)}
  onUpload={async (file, onProgress) => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200));
      onProgress(i);
    }
  }}
/>`;

const simulateUpload = async (_file: File, onProgress: (percent: number) => void) => {
    for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 200));
        onProgress(i);
    }
};

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Image Upload" description="Drag and drop or click to upload images with progress tracking and preview.">
            <div className="w-full max-w-lg">
                <FileUpload
                    accept="image/*"
                    multiple
                    maxFileSize={5 * 1024 * 1024}
                    maxFiles={5}
                    showPreview
                    onFilesSelect={(files) => console.log('Selected:', files)}
                    onUpload={simulateUpload}
                />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
