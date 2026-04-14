import React, { useState } from 'react';
import { Droppable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

interface DroppedFile {
    name: string;
    size: number;
    type: string;
}

const code = `<Droppable
  containerId="files"
  index={0}
  acceptFiles
  onDrop={(source) => {
    const fileList = source.item.files as FileList;
    // handle files...
  }}
>
  <div>Drop files from your desktop here</div>
</Droppable>`;

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const FileDropZone: React.FC = () => {
    const [files, setFiles] = useState<DroppedFile[]>([]);

    return (
        <>
            <ComponentDemo title="Native OS File Drop">
                <div className="w-full max-w-xl">
                    <Droppable
                        containerId="file-drop-zone"
                        index={0}
                        acceptFiles
                        dropIndicator="highlight"
                        className="min-h-40 flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/30"
                        onDrop={(source) => {
                            const fileList = (source.item as { files?: FileList }).files;
                            if (!fileList) return;
                            const next: DroppedFile[] = [];
                            for (let i = 0; i < fileList.length; i++) {
                                const f = fileList[i]!;
                                next.push({ name: f.name, size: f.size, type: f.type || 'unknown' });
                            }
                            setFiles((prev) => [...next, ...prev].slice(0, 20));
                        }}
                    >
                        <div className="text-center">
                            <div className="text-3xl mb-1">📁</div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Drop files from your desktop here</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Accepts any file type — uses native OS drag</div>
                        </div>
                    </Droppable>
                    {files.length > 0 && (
                        <div className="mt-4 space-y-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Recently dropped ({files.length})
                            </div>
                            {files.map((f, i) => (
                                <div
                                    key={`${f.name}-${i}`}
                                    className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 px-3 py-1.5"
                                >
                                    <span className="truncate text-gray-900 dark:text-gray-100">{f.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-3 flex-shrink-0">
                                        {formatSize(f.size)} · {f.type}
                                    </span>
                                </div>
                            ))}
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

export default FileDropZone;
