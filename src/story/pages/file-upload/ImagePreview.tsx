import React from 'react';
import { FileUpload } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const simulateUpload = async (_file: File, onProgress: (percent: number) => void) => {
    for (let i = 0; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 300));
        onProgress(i);
    }
};

const code = `import { FileUpload } from 'fluxo-ui';

<FileUpload
  accept="image/*"
  multiple
  maxFiles={4}
  showPreview
  onUpload={async (file, onProgress) => {
    // simulate upload
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((r) => setTimeout(r, 300));
      onProgress(i);
    }
  }}
/>`;

const ImagePreview: React.FC = () => (
    <>
        <ComponentDemo title="Image Preview" description="Uploaded images show thumbnail previews with progress bars during upload.">
            <div className="w-full max-w-lg">
                <FileUpload accept="image/*" multiple maxFiles={4} showPreview onUpload={simulateUpload} />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ImagePreview;
