import React, { useCallback, useState } from 'react';
import type { ExportFormat } from '../../../components';
import { ImageEditor } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sampleImage = 'https://picsum.photos/seed/ether/800/600';

const code = `import { ImageEditor } from 'fluxo-ui';

<ImageEditor
  src="https://picsum.photos/seed/ether/800/600"
  exportOptions={{
    format: 'jpeg',
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 900,
  }}
  onSave={(blob, format) => {
    console.log(\`Saved as \${format}, size: \${blob.size} bytes\`);
  }}
/>`;

const ExportOptions: React.FC = () => {
    const [saveInfo, setSaveInfo] = useState<string | null>(null);

    const handleSave = useCallback((blob: Blob, format: ExportFormat) => {
        const sizeKb = (blob.size / 1024).toFixed(1);
        setSaveInfo(`Format: ${format}, Size: ${sizeKb} KB`);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-demo.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    return (
        <>
            <ComponentDemo
                title="Export Options"
                description="Configure export format, quality, and max dimensions. This example exports as JPEG at 80% quality with max 1200x900."
            >
                <div className="w-full" style={{ height: 500 }}>
                    <ImageEditor
                        src={sampleImage}
                        alt="Export options demo"
                        exportOptions={{
                            format: 'jpeg',
                            quality: 0.8,
                            maxWidth: 1200,
                            maxHeight: 900,
                        }}
                        onSave={handleSave}
                    />
                </div>
                {saveInfo && <p className="mt-2 text-sm text-blue-600">{saveInfo}</p>}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ExportOptions;
