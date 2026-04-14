import { useCallback, useEffect, useRef, useState } from 'react';

export type UploadStrategy = 'immediate' | 'deferred';

export type UploadImageFn = (file: File) => Promise<string>;

export type InsertImageFormatter = (args: { url: string; alt: string; uploading?: boolean }) => string;

export interface PendingUpload {
    id: string;
    blobUrl: string;
    file: File;
    alt: string;
    status: 'pending' | 'uploading' | 'done' | 'error';
    finalUrl?: string;
    error?: string;
}

export interface UseImageUploadOptions {
    uploadImage?: UploadImageFn;
    strategy?: UploadStrategy;
    maxImageSize?: number;
    acceptedImageTypes?: string[];
    formatInsert: InsertImageFormatter;
    onError?: (message: string, file?: File) => void;
}

export interface UseImageUploadResult {
    pending: PendingUpload[];
    handleFiles: (files: FileList | File[] | null | undefined) => Promise<string[]>;
    flushUploads: (value: string) => Promise<string>;
    validateFile: (file: File) => string | null;
    hasUploader: boolean;
    isUploading: boolean;
}

function genId(): string {
    return 'img_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function createBlobUrl(file: File): string {
    return URL.createObjectURL(file);
}

export function useImageUpload(options: UseImageUploadOptions): UseImageUploadResult {
    const { uploadImage, strategy = 'immediate', maxImageSize, acceptedImageTypes, formatInsert, onError } = options;
    const [pending, setPending] = useState<PendingUpload[]>([]);
    const pendingRef = useRef<PendingUpload[]>([]);
    pendingRef.current = pending;
    const blobRegistry = useRef<Set<string>>(new Set());

    useEffect(() => {
        const registry = blobRegistry.current;
        return () => {
            registry.forEach((url) => {
                try {
                    URL.revokeObjectURL(url);
                } catch {
                    /* noop */
                }
            });
            registry.clear();
        };
    }, []);

    const validateFile = useCallback(
        (file: File): string | null => {
            if (acceptedImageTypes && acceptedImageTypes.length > 0 && !acceptedImageTypes.includes(file.type)) {
                return 'Unsupported image type: ' + (file.type || 'unknown');
            }
            if (!acceptedImageTypes && !file.type.startsWith('image/')) {
                return 'File is not an image';
            }
            if (maxImageSize && file.size > maxImageSize) {
                const mb = (maxImageSize / (1024 * 1024)).toFixed(1);
                return 'Image exceeds max size of ' + mb + ' MB';
            }
            return null;
        },
        [acceptedImageTypes, maxImageSize],
    );

    const updatePending = useCallback((id: string, patch: Partial<PendingUpload>) => {
        setPending((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    }, []);

    const handleFiles = useCallback(
        async (files: FileList | File[] | null | undefined): Promise<string[]> => {
            if (!files) return [];
            const fileArr = Array.from(files);
            const inserts: string[] = [];
            for (const file of fileArr) {
                const validationError = validateFile(file);
                if (validationError) {
                    onError?.(validationError, file);
                    continue;
                }
                const alt = file.name.replace(/\.[^.]+$/, '');
                if (strategy === 'immediate' && uploadImage) {
                    const placeholderId = genId();
                    const placeholder = formatInsert({ url: '', alt, uploading: true });
                    inserts.push(placeholder);
                    const entry: PendingUpload = {
                        id: placeholderId,
                        blobUrl: '',
                        file,
                        alt,
                        status: 'uploading',
                    };
                    setPending((list) => [...list, entry]);
                    try {
                        const finalUrl = await uploadImage(file);
                        updatePending(placeholderId, { status: 'done', finalUrl });
                    } catch (err) {
                        const msg = err instanceof Error ? err.message : 'Upload failed';
                        updatePending(placeholderId, { status: 'error', error: msg });
                        onError?.(msg, file);
                    }
                } else {
                    const blobUrl = createBlobUrl(file);
                    blobRegistry.current.add(blobUrl);
                    const id = genId();
                    const entry: PendingUpload = {
                        id,
                        blobUrl,
                        file,
                        alt,
                        status: 'pending',
                    };
                    setPending((list) => [...list, entry]);
                    inserts.push(formatInsert({ url: blobUrl, alt }));
                }
            }
            return inserts;
        },
        [formatInsert, onError, strategy, updatePending, uploadImage, validateFile],
    );

    const flushUploads = useCallback(
        async (value: string): Promise<string> => {
            if (!uploadImage) return value;
            let output = value;
            const deferredPending = pendingRef.current.filter(
                (p) => p.status === 'pending' && p.blobUrl && output.includes(p.blobUrl),
            );
            const immediateDone = pendingRef.current.filter(
                (p) => p.status === 'done' && p.finalUrl && p.blobUrl && output.includes(p.blobUrl),
            );
            for (const p of immediateDone) {
                if (p.finalUrl) {
                    output = output.split(p.blobUrl).join(p.finalUrl);
                    updatePending(p.id, { status: 'done' });
                }
            }
            for (const p of deferredPending) {
                updatePending(p.id, { status: 'uploading' });
                try {
                    const finalUrl = await uploadImage(p.file);
                    output = output.split(p.blobUrl).join(finalUrl);
                    updatePending(p.id, { status: 'done', finalUrl });
                    try {
                        URL.revokeObjectURL(p.blobUrl);
                        blobRegistry.current.delete(p.blobUrl);
                    } catch {
                        /* noop */
                    }
                } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Upload failed';
                    updatePending(p.id, { status: 'error', error: msg });
                    onError?.(msg, p.file);
                    throw err;
                }
            }
            return output;
        },
        [onError, updatePending, uploadImage],
    );

    const isUploading = pending.some((p) => p.status === 'uploading');

    return {
        pending,
        handleFiles,
        flushUploads,
        validateFile,
        hasUploader: Boolean(uploadImage),
        isUploading,
    };
}
