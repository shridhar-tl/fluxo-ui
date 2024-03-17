import classNames from 'classnames';
import React, { memo } from 'react';
import type { UploadFile } from './file-upload-types';

interface FilePreviewProps {
    uploadFile: UploadFile;
    showPreview: boolean;
    onRemove: (uploadFile: UploadFile) => void;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${size} ${units[i]}`;
}

function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

function getFileTypeIcon(file: File): string {
    const type = file.type;
    if (type.startsWith('image/')) return '\uD83D\uDDBC\uFE0F';
    if (type.startsWith('video/')) return '\uD83C\uDFA5';
    if (type.startsWith('audio/')) return '\uD83C\uDFB5';
    if (type.includes('pdf')) return '\uD83D\uDCC4';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '\uD83D\uDCE6';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '\uD83D\uDCCA';
    if (type.includes('document') || type.includes('word')) return '\uD83D\uDCC3';
    return '\uD83D\uDCC1';
}

function getStatusIcon(status: UploadFile['status']): string {
    switch (status) {
        case 'success': return '\u2713';
        case 'error': return '\u2717';
        case 'uploading': return '';
        default: return '';
    }
}

const FilePreview: React.FC<FilePreviewProps> = ({ uploadFile, showPreview, onRemove }) => {
    const { file, progress, status, previewUrl, error } = uploadFile;

    const itemClass = classNames('eui-fu-file-item', {
        'eui-fu-file-error': status === 'error',
        'eui-fu-file-success': status === 'success',
    });

    const progressFillClass = classNames('eui-fu-progress-fill', {
        'eui-fu-progress-success': status === 'success',
        'eui-fu-progress-error': status === 'error',
    });

    const statusClass = classNames('eui-fu-file-status', {
        'eui-fu-status-success': status === 'success',
        'eui-fu-status-error': status === 'error',
        'eui-fu-status-uploading': status === 'uploading',
    });

    const progressWidth = status === 'success' ? 100 : status === 'error' ? progress : progress;

    return (
        <div className={itemClass} role="listitem">
            {showPreview && (
                <div className="eui-fu-preview">
                    {isImageFile(file) && previewUrl ? (
                        <img src={previewUrl} alt={file.name} />
                    ) : (
                        <span className="eui-fu-file-icon">{getFileTypeIcon(file)}</span>
                    )}
                </div>
            )}
            <div className="eui-fu-file-info">
                <div className="eui-fu-file-header">
                    <span className="eui-fu-file-name" title={file.name}>{file.name}</span>
                    <span className="eui-fu-file-size">{formatFileSize(file.size)}</span>
                </div>
                {(status === 'uploading' || status === 'success' || status === 'error') && (
                    <div className="eui-fu-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                        <div className={progressFillClass} style={{ width: `${progressWidth}%` }} />
                    </div>
                )}
                {error && <span className="eui-fu-file-error-msg">{error}</span>}
            </div>
            {status !== 'pending' && status !== 'uploading' && (
                <span className={statusClass} aria-label={status}>
                    {getStatusIcon(status)}
                </span>
            )}
            {status === 'uploading' && (
                <span className={statusClass} aria-label="uploading">
                    {Math.round(progress)}%
                </span>
            )}
            <button
                className="eui-fu-remove-btn"
                type="button"
                onClick={() => onRemove(uploadFile)}
                aria-label={`Remove ${file.name}`}
                tabIndex={0}
            >
                &times;
            </button>
        </div>
    );
};

export default memo(FilePreview);
