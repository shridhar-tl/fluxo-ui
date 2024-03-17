import { ReactNode } from 'react';

export interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    previewUrl?: string;
    error?: string;
}

export interface FileUploadProps {
    accept?: string;
    multiple?: boolean;
    maxFileSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    className?: string;
    dropzoneContent?: ReactNode;
    showPreview?: boolean;
    onFilesSelect?: (files: File[]) => void;
    onFileRemove?: (file: UploadFile) => void;
    onUpload?: (file: File, onProgress: (percent: number) => void) => Promise<void>;
    customValidator?: (file: File) => string | undefined;
}
