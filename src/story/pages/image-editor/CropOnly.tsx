import React, { useCallback } from 'react';
import { ImageEditor } from '../../../components';
import type { ExportFormat } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sampleImage = 'https://picsum.photos/seed/ether/800/600';

const code = `import { ImageEditor } from 'ether-ui';

<ImageEditor
  src="https://picsum.photos/seed/ether/800/600"
  tools={['crop']}
  defaultTool="crop"
  cropModes={['custom', 'square', '16:9', '4:3', '1:1']}
  onSave={handleSave}
/>`;

const CropOnly: React.FC = () => {
    const handleSave = useCallback((blob: Blob, format: ExportFormat) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cropped-image.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

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

export default CropOnly;
