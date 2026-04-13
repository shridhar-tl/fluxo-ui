import React, { useCallback, useState } from 'react';
import type { ExportFormat } from '../../../components';
import { ImageEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sampleImage = 'https://picsum.photos/seed/ether/800/600';

const code = `import { ImageEditor } from 'fluxo-ui';

const handleSave = (blob: Blob, format: ExportFormat) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`edited-image.\${format}\`;
  a.click();
  URL.revokeObjectURL(url);
};

<ImageEditor
  src="https://picsum.photos/seed/ether/800/600"
  alt="Sample landscape"
  onSave={handleSave}
  onCancel={() => console.log('Cancelled')}
/>`;

const BasicUsage: React.FC = () => {
    const [savedUrl, setSavedUrl] = useState<string | null>(null);

    const handleSave = useCallback((blob: Blob, format: ExportFormat) => {
        const url = URL.createObjectURL(blob);
        setSavedUrl(url);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited-image.${format}`;
        a.click();
    }, []);

    const handleCancel = useCallback(() => {
        setSavedUrl(null);
    }, []);

    return (
        <>
            <ComponentDemo
                title="Full Editor"
                description="Image editor with all tools enabled. Edit the image and click Save to download."
            >
                <div className="w-full" style={{ height: 500 }}>
                    <ImageEditor src={sampleImage} alt="Sample landscape" onSave={handleSave} onCancel={handleCancel} />
                </div>
                {savedUrl && <p className="mt-2 text-sm text-green-600">Image saved and downloaded successfully.</p>}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
