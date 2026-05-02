import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FolderIcon } from '../../assets/icons';
import type { FileUploadProps, UploadFile } from './file-upload-types';
import FilePreview from './FilePreview';
import './FileUpload.scss';

let fileIdCounter = 0;

function generateFileId(): string {
    fileIdCounter += 1;
    return `fu-${Date.now()}-${fileIdCounter}`;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

function validateFileType(file: File, accept: string): boolean {
    if (!accept) return true;
    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());

    return acceptedTypes.some(type => {
        if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type);
        }
        if (type.endsWith('/*')) {
            const baseType = type.replace('/*', '');
            return file.type.toLowerCase().startsWith(baseType);
        }
        return file.type.toLowerCase() === type;
    });
}

function createPreviewUrl(file: File): string | undefined {
    if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
    }
    return undefined;
}

const FileUpload: React.FC<FileUploadProps> = ({
    accept,
    multiple = false,
    maxFileSize,
    maxFiles,
    disabled = false,
    className,
    dropzoneContent,
    showPreview = true,
    onFilesSelect,
    onFileRemove,
    onUpload,
    customValidator,
}) => {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [announcement, setAnnouncement] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);
    const previousFileIdsRef = useRef<Set<string>>(new Set());
    const reactId = useId();
    const dropzoneId = `eui-fu-dropzone-${reactId}`;
    const hintId = `eui-fu-hint-${reactId}`;
    const labelId = `eui-fu-label-${reactId}`;

    useEffect(() => {
        return () => {
            files.forEach(f => {
                if (f.previewUrl) {
                    URL.revokeObjectURL(f.previewUrl);
                }
            });
        };
    }, []);

    useEffect(() => {
        const currentIds = new Set(files.map(f => f.id));
        const previousIds = previousFileIdsRef.current;
        const added: UploadFile[] = files.filter(f => !previousIds.has(f.id));
        const removed: string[] = [];
        previousIds.forEach(id => {
            if (!currentIds.has(id)) removed.push(id);
        });
        const messages: string[] = [];
        if (added.length === 1) {
            messages.push(`Added ${added[0].file.name}`);
        } else if (added.length > 1) {
            messages.push(`Added ${added.length} files`);
        }
        if (removed.length === 1) {
            messages.push(`Removed file`);
        } else if (removed.length > 1) {
            messages.push(`Removed ${removed.length} files`);
        }
        if (messages.length > 0) {
            setAnnouncement(messages.join('. '));
        }
        previousFileIdsRef.current = currentIds;
    }, [files]);

    const validateFile = useCallback((file: File): string | undefined => {
        if (accept && !validateFileType(file, accept)) {
            return `File type not accepted. Allowed: ${accept}`;
        }
        if (maxFileSize && file.size > maxFileSize) {
            return `File exceeds maximum size of ${formatBytes(maxFileSize)}`;
        }
        if (customValidator) {
            return customValidator(file);
        }
        return undefined;
    }, [accept, maxFileSize, customValidator]);

    const startUpload = useCallback((uploadFile: UploadFile) => {
        if (!onUpload) return;

        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
        ));

        const onProgress = (percent: number) => {
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? { ...f, progress: Math.min(percent, 100) } : f
            ));
        };

        onUpload(uploadFile.file, onProgress)
            .then(() => {
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id ? { ...f, status: 'success' as const, progress: 100 } : f
                ));
            })
            .catch((err: Error) => {
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'error' as const, error: err?.message || 'Upload failed' }
                        : f
                ));
            });
    }, [onUpload]);

    const processFiles = useCallback((fileList: FileList | File[]) => {
        const rawFiles = Array.from(fileList);

        if (!multiple && rawFiles.length > 0) {
            rawFiles.splice(1);
        }

        const currentCount = files.length;
        let filesToProcess = rawFiles;

        if (maxFiles) {
            const remainingSlots = maxFiles - currentCount;
            if (remainingSlots <= 0) return;
            filesToProcess = rawFiles.slice(0, remainingSlots);
        }

        const newUploadFiles: UploadFile[] = filesToProcess.map(file => {
            const error = validateFile(file);
            const previewUrl = error ? undefined : createPreviewUrl(file);
            return {
                id: generateFileId(),
                file,
                progress: 0,
                status: error ? 'error' as const : 'pending' as const,
                previewUrl,
                error,
            };
        });

        setFiles(prev => [...prev, ...newUploadFiles]);

        const validFiles = newUploadFiles.filter(f => f.status !== 'error');
        if (validFiles.length > 0) {
            onFilesSelect?.(validFiles.map(f => f.file));
        }

        if (onUpload) {
            validFiles.forEach(uploadFile => {
                startUpload(uploadFile);
            });
        }
    }, [files.length, multiple, maxFiles, validateFile, onFilesSelect, onUpload, startUpload]);

    const handleRemove = useCallback((uploadFile: UploadFile) => {
        if (uploadFile.previewUrl) {
            URL.revokeObjectURL(uploadFile.previewUrl);
        }
        setFiles(prev => prev.filter(f => f.id !== uploadFile.id));
        onFileRemove?.(uploadFile);
    }, [onFileRemove]);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current += 1;
        if (e.dataTransfer.types.includes('Files')) {
            setIsDragOver(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current -= 1;
        if (dragCounterRef.current === 0) {
            setIsDragOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragOver(false);

        if (disabled) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            processFiles(droppedFiles);
        }
    }, [disabled, processFiles]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            processFiles(selectedFiles);
        }
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [processFiles]);

    const openFilePicker = useCallback(() => {
        if (!disabled) {
            inputRef.current?.click();
        }
    }, [disabled]);

    const handleZoneKeyDown = useCallback((e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
        }
    }, [disabled]);

    const dropzoneClass = classNames('eui-fu-dropzone', {
        'eui-fu-dragover': isDragOver,
        'eui-fu-disabled': disabled,
    });

    const containerClass = classNames('eui-file-upload', className);

    const hintParts: string[] = [];
    if (accept) {
        hintParts.push(`Accepted: ${accept}`);
    }
    if (maxFileSize) {
        hintParts.push(`Max: ${formatBytes(maxFileSize)}`);
    }
    if (maxFiles) {
        hintParts.push(`Up to ${maxFiles} file${maxFiles > 1 ? 's' : ''}`);
    }

    const describedBy = hintParts.length > 0 ? hintId : undefined;

    return (
        <div className={containerClass}>
            <div
                id={dropzoneId}
                className={dropzoneClass}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={openFilePicker}
                onKeyDown={handleZoneKeyDown}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-labelledby={labelId}
                aria-describedby={describedBy}
                aria-disabled={disabled}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    aria-hidden="true"
                />
                {dropzoneContent || (
                    <>
                        <FolderIcon className="eui-fu-dropzone-icon" aria-hidden="true" />
                        <span id={labelId} className="eui-fu-dropzone-text">
                            Drag & drop files here, or <span className="eui-fu-browse-link">browse</span> to choose
                        </span>
                        {hintParts.length > 0 && (
                            <span id={hintId} className="eui-fu-dropzone-hint">{hintParts.join(' • ')}</span>
                        )}
                    </>
                )}
            </div>
            <button
                type="button"
                className="eui-fu-browse-button"
                onClick={openFilePicker}
                disabled={disabled}
                aria-describedby={describedBy}
            >
                Choose {multiple ? 'files' : 'a file'}
            </button>
            {files.length > 0 && (
                <div className="eui-fu-file-list" role="list" aria-label="Uploaded files">
                    {files.map(uploadFile => (
                        <FilePreview
                            key={uploadFile.id}
                            uploadFile={uploadFile}
                            showPreview={showPreview}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>
            )}
            <div
                className="eui-fu-sr-only"
                aria-live="polite"
                aria-atomic="true"
                role="status"
            >
                {announcement}
            </div>
        </div>
    );
};

export { FileUpload };
