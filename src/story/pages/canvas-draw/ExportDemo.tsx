import cn from 'classnames';
import React, { useCallback, useState } from 'react';
import CanvasDraw from '../../../components/canvas-draw/CanvasDraw';
import type { ImageExportFormat } from '../../../components/canvas-draw/canvas-draw-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `const handleExport = (dataUrl: string, format: ImageExportFormat) => {
  // dataUrl contains the image data
  // SVG export works without extra dependencies
  // PNG/JPG/WebP requires: npm install html2canvas
  console.log(\`Exported \${format}:\`, dataUrl.length, 'chars');
};

<CanvasDraw
  background={{ type: 'color', color: '#f0f9ff' }}
  onExport={handleExport}
  features={{ export: true }}
/>`;

const ExportDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [exportUrl, setExportUrl] = useState<string | null>(null);
    const [exportFormat, setExportFormat] = useState<string>('');

    const handleExport = useCallback((dataUrl: string, format: ImageExportFormat) => {
        setExportUrl(dataUrl);
        setExportFormat(format);
    }, []);

    return (
        <>
            <ComponentDemo title="Export Drawing" centered={false}>
                <div className="space-y-3">
                    <CanvasDraw
                        background={{ type: 'color', color: '#f0f9ff' }}
                        onExport={handleExport}
                        features={{ export: true }}
                        style={{ height: 380 }}
                    />
                    {exportUrl && (
                        <div className={cn('text-sm px-4 py-2 rounded border', {
                            'border-green-800 bg-green-900/30 text-green-300': isDark,
                            'border-green-200 bg-green-50 text-green-800': !isDark,
                        })}>
                            Exported as <strong>{exportFormat.toUpperCase()}</strong> — data URL generated ({exportUrl.length} chars)
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ExportDemo;
