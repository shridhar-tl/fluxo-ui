import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
    BlurRegion,
    CropArea,
    CropMode,
    EditorTool,
    ExportFormat,
    ExportOptions,
    HistoryEntry,
    ImageEditorProps,
    ImageTransform,
} from './image-editor-types';
import { aspectRatios } from './image-editor-types';
import './ImageEditor.scss';

const defaultTransform: ImageTransform = {
    rotation: 0,
    flipH: false,
    flipV: false,
    tilt: 0,
    zoom: 1,
    transparency: 1,
};

const defaultExportOptions: ExportOptions = {
    format: 'png',
    quality: 0.92,
};

const allTools: EditorTool[] = ['crop', 'rotate', 'flip', 'blur', 'annotate', 'transparency', 'tilt'];
const allCropModes: CropMode[] = ['custom', 'square', 'circle', '16:9', '4:3', '3:2', '1:1'];

const toolIcons: Record<EditorTool, React.ReactNode> = {
    crop: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.13 1L6 16a2 2 0 002 2h15" /><path d="M1 6.13L16 6a2 2 0 012 2v15" />
        </svg>
    ),
    rotate: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
        </svg>
    ),
    flip: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h3M16 3h3a2 2 0 012 2v14a2 2 0 01-2 2h-3M12 20V4" />
        </svg>
    ),
    blur: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
    ),
    annotate: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
        </svg>
    ),
    transparency: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 010 20" fill="currentColor" opacity="0.3" />
        </svg>
    ),
    tilt: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" transform="rotate(5 12 12)" />
        </svg>
    ),
};

const ImageEditor: React.FC<ImageEditorProps> = ({
    src,
    alt: _alt = 'Image',
    width = '100%',
    height = 500,
    onSave,
    onCancel,
    tools = allTools,
    defaultTool = 'crop',
    maxHistory = 50,
    className,
    exportOptions: exportOptionsProp,
    cropModes = allCropModes,
    editState,
    onEditStateChange,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [loaded, setLoaded] = useState(false);
    const [activeTool, setActiveTool] = useState<EditorTool>(defaultTool);
    const [baseImage, setBaseImage] = useState<string>(editState?.baseImage ?? src);
    const [transform, setTransform] = useState<ImageTransform>(editState ? { ...editState.transform } : { ...defaultTransform });
    const [cropArea, setCropArea] = useState<CropArea | null>(editState?.cropArea ?? null);
    const [cropMode, setCropMode] = useState<CropMode>(editState?.cropMode ?? 'custom');
    const [isCropping, setIsCropping] = useState(false);
    const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
    const [blurRegions, setBlurRegions] = useState<BlurRegion[]>(editState?.blurRegions ? [...editState.blurRegions] : []);
    const [isDrawingBlur, setIsDrawingBlur] = useState(false);
    const [blurStart, setBlurStart] = useState<{ x: number; y: number } | null>(null);
    const [blurIntensity, setBlurIntensity] = useState(10);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showExport, setShowExport] = useState(false);
    const [exportOpts, setExportOpts] = useState<ExportOptions>({
        ...defaultExportOptions,
        ...exportOptionsProp,
    });
    const [annotationData, setAnnotationData] = useState<string | null>(editState?.annotationData ?? null);

    const [freehandActive, setFreehandActive] = useState(false);
    const [freehandColor, setFreehandColor] = useState('#ef4444');
    const [freehandSize, setFreehandSize] = useState(3);
    const freehandPointsRef = useRef<Array<{ x: number; y: number }>>([]);
    const annotationCanvasRef = useRef<HTMLCanvasElement>(null);

    const onChangeRef = useRef(onEditStateChange);
    useEffect(() => {
        onChangeRef.current = onEditStateChange;
    }, [onEditStateChange]);

    const hydratedAnnotationRef = useRef(false);
    const emitReadyRef = useRef(false);

    useEffect(() => {
        if (!loaded) return;
        if (!emitReadyRef.current) {
            emitReadyRef.current = true;
            return;
        }
        const cb = onChangeRef.current;
        if (!cb) return;
        cb({
            baseImage,
            transform: { ...transform },
            cropArea: cropArea ? { ...cropArea } : null,
            cropMode,
            blurRegions: blurRegions.map((r) => ({ ...r })),
            annotationData,
        });
    }, [loaded, baseImage, transform, cropArea, cropMode, blurRegions, annotationData]);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imageRef.current = img;
            setLoaded(true);
            pushHistory({ ...defaultTransform }, null);
        };
        img.src = baseImage;
    }, [baseImage]);

    useEffect(() => {
        if (loaded) renderCanvas();
    }, [loaded, transform, cropArea, blurRegions, annotationData]);

    const pushHistory = useCallback(
        (t: ImageTransform, crop: CropArea | null) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const entry: HistoryEntry = {
                imageData: canvas.toDataURL(),
                transform: { ...t },
                cropArea: crop ? { ...crop } : null,
            };
            setHistory((prev) => {
                const next = prev.slice(0, historyIndex + 1);
                next.push(entry);
                if (next.length > maxHistory) next.shift();
                return next;
            });
            setHistoryIndex((prev) => Math.min(prev + 1, maxHistory - 1));
        },
        [historyIndex, maxHistory],
    );

    const undo = useCallback(() => {
        if (historyIndex <= 0) return;
        const newIdx = historyIndex - 1;
        const entry = history[newIdx];
        if (entry) {
            setTransform({ ...entry.transform });
            setCropArea(entry.cropArea);
            setHistoryIndex(newIdx);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return;
        const newIdx = historyIndex + 1;
        const entry = history[newIdx];
        if (entry) {
            setTransform({ ...entry.transform });
            setCropArea(entry.cropArea);
            setHistoryIndex(newIdx);
        }
    }, [history, historyIndex]);

    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((transform.rotation * Math.PI) / 180);
        ctx.rotate((transform.tilt * Math.PI) / 180);
        ctx.scale(
            transform.flipH ? -transform.zoom : transform.zoom,
            transform.flipV ? -transform.zoom : transform.zoom,
        );
        ctx.globalAlpha = transform.transparency;
        ctx.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.drawImage(img, 0, 0);

        ctx.restore();

        for (const region of blurRegions) {
            applyBlurRegion(ctx, canvas, region);
        }

        const annotCanvas = annotationCanvasRef.current;
        if (annotCanvas && annotCanvas.width > 0 && annotCanvas.height > 0) {
            ctx.drawImage(annotCanvas, 0, 0, canvas.width, canvas.height);
        } else if (annotationData) {
            const annotImg = new Image();
            annotImg.onload = () => {
                ctx.drawImage(annotImg, 0, 0, canvas.width, canvas.height);
            };
            annotImg.src = annotationData;
        }

        if (cropArea && activeTool === 'crop') {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'destination-out';
            if (cropMode === 'circle') {
                ctx.beginPath();
                ctx.ellipse(
                    cropArea.x + cropArea.width / 2,
                    cropArea.y + cropArea.height / 2,
                    cropArea.width / 2,
                    cropArea.height / 2,
                    0, 0, Math.PI * 2,
                );
                ctx.fill();
            } else {
                ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            if (cropMode === 'circle') {
                ctx.beginPath();
                ctx.ellipse(
                    cropArea.x + cropArea.width / 2,
                    cropArea.y + cropArea.height / 2,
                    cropArea.width / 2,
                    cropArea.height / 2,
                    0, 0, Math.PI * 2,
                );
                ctx.stroke();
            } else {
                ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

                const thirdW = cropArea.width / 3;
                const thirdH = cropArea.height / 3;
                ctx.lineWidth = 0.5;
                ctx.setLineDash([]);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                for (let i = 1; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(cropArea.x + thirdW * i, cropArea.y);
                    ctx.lineTo(cropArea.x + thirdW * i, cropArea.y + cropArea.height);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(cropArea.x, cropArea.y + thirdH * i);
                    ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + thirdH * i);
                    ctx.stroke();
                }
            }

            ctx.restore();
        }
    }, [transform, cropArea, cropMode, blurRegions, annotationData, activeTool]);

    useEffect(() => {
        if (!loaded) return;
        const saved = editState?.annotationData ?? null;
        if (hydratedAnnotationRef.current || !saved) return;
        hydratedAnnotationRef.current = true;
        const aCanvas = annotationCanvasRef.current;
        const main = canvasRef.current;
        if (!aCanvas || !main) return;
        aCanvas.width = main.width;
        aCanvas.height = main.height;
        const ctx = aCanvas.getContext('2d');
        if (!ctx) return;
        const annotImg = new Image();
        annotImg.onload = () => {
            ctx.drawImage(annotImg, 0, 0, aCanvas.width, aCanvas.height);
            renderCanvas();
        };
        annotImg.src = saved;
    }, [loaded, editState, renderCanvas]);

    const applyBlurRegion = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, region: BlurRegion) => {
        const x = Math.max(0, Math.floor(region.x));
        const y = Math.max(0, Math.floor(region.y));
        const w = Math.min(canvas.width - x, Math.floor(region.width));
        const h = Math.min(canvas.height - y, Math.floor(region.height));
        if (w <= 0 || h <= 0) return;

        const imgData = ctx.getImageData(x, y, w, h);
        const pixels = imgData.data;
        const blockSize = Math.max(1, Math.floor(region.intensity));

        for (let by = 0; by < h; by += blockSize) {
            for (let bx = 0; bx < w; bx += blockSize) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                for (let dy = 0; dy < blockSize && by + dy < h; dy++) {
                    for (let dx = 0; dx < blockSize && bx + dx < w; dx++) {
                        const idx = ((by + dy) * w + (bx + dx)) * 4;
                        r += pixels[idx];
                        g += pixels[idx + 1];
                        b += pixels[idx + 2];
                        a += pixels[idx + 3];
                        count++;
                    }
                }
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                a = Math.round(a / count);
                for (let dy = 0; dy < blockSize && by + dy < h; dy++) {
                    for (let dx = 0; dx < blockSize && bx + dx < w; dx++) {
                        const idx = ((by + dy) * w + (bx + dx)) * 4;
                        pixels[idx] = r;
                        pixels[idx + 1] = g;
                        pixels[idx + 2] = b;
                        pixels[idx + 3] = a;
                    }
                }
            }
        }
        ctx.putImageData(imgData, x, y);
    };

    const getCanvasCoords = useCallback(
        (e: React.MouseEvent): { x: number; y: number } => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY,
            };
        },
        [],
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            const coords = getCanvasCoords(e);

            if (activeTool === 'crop') {
                setIsCropping(true);
                setCropStart(coords);
                setCropArea({ x: coords.x, y: coords.y, width: 0, height: 0 });
            } else if (activeTool === 'blur') {
                setIsDrawingBlur(true);
                setBlurStart(coords);
            } else if (activeTool === 'annotate' && freehandActive) {
                freehandPointsRef.current = [coords];
            }
        },
        [activeTool, getCanvasCoords, freehandActive],
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const coords = getCanvasCoords(e);

            if (activeTool === 'crop' && isCropping && cropStart) {
                let w = coords.x - cropStart.x;
                let h = coords.y - cropStart.y;
                const ratio = aspectRatios[cropMode];
                if (ratio) {
                    h = w / ratio;
                }
                setCropArea({
                    x: Math.min(cropStart.x, cropStart.x + w),
                    y: Math.min(cropStart.y, cropStart.y + h),
                    width: Math.abs(w),
                    height: Math.abs(h),
                });
            } else if (activeTool === 'blur' && isDrawingBlur && blurStart) {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                renderCanvas();

                const x = Math.min(blurStart.x, coords.x);
                const y = Math.min(blurStart.y, coords.y);
                const w = Math.abs(coords.x - blurStart.x);
                const h = Math.abs(coords.y - blurStart.y);

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(x, y, w, h);
            } else if (activeTool === 'annotate' && freehandActive && freehandPointsRef.current.length > 0) {
                freehandPointsRef.current.push(coords);
                const pts = freehandPointsRef.current;
                if (pts.length < 2) return;

                const aCanvas = annotationCanvasRef.current;
                const mainCanvas = canvasRef.current;
                const aCtx = aCanvas?.getContext('2d') ?? null;
                const mainCtx = mainCanvas?.getContext('2d') ?? null;

                const scaleX = aCanvas && mainCanvas ? aCanvas.width / mainCanvas.width : 1;
                const scaleY = aCanvas && mainCanvas ? aCanvas.height / mainCanvas.height : 1;

                const setStrokeStyle = (ctx: CanvasRenderingContext2D, sx: number, sy: number) => {
                    ctx.strokeStyle = freehandColor;
                    ctx.lineWidth = freehandSize * Math.max(sx, sy);
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                };

                if (pts.length === 2) {
                    if (aCtx) {
                        setStrokeStyle(aCtx, scaleX, scaleY);
                        aCtx.beginPath();
                        aCtx.moveTo(pts[0].x * scaleX, pts[0].y * scaleY);
                        aCtx.lineTo(pts[1].x * scaleX, pts[1].y * scaleY);
                        aCtx.stroke();
                    }
                    if (mainCtx) {
                        setStrokeStyle(mainCtx, 1, 1);
                        mainCtx.beginPath();
                        mainCtx.moveTo(pts[0].x, pts[0].y);
                        mainCtx.lineTo(pts[1].x, pts[1].y);
                        mainCtx.stroke();
                    }
                } else {
                    const p0 = pts[pts.length - 3];
                    const p1 = pts[pts.length - 2];
                    const p2 = pts[pts.length - 1];
                    const midA = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
                    const midB = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

                    if (aCtx) {
                        setStrokeStyle(aCtx, scaleX, scaleY);
                        aCtx.beginPath();
                        aCtx.moveTo(midA.x * scaleX, midA.y * scaleY);
                        aCtx.quadraticCurveTo(p1.x * scaleX, p1.y * scaleY, midB.x * scaleX, midB.y * scaleY);
                        aCtx.stroke();
                    }
                    if (mainCtx) {
                        setStrokeStyle(mainCtx, 1, 1);
                        mainCtx.beginPath();
                        mainCtx.moveTo(midA.x, midA.y);
                        mainCtx.quadraticCurveTo(p1.x, p1.y, midB.x, midB.y);
                        mainCtx.stroke();
                    }
                }
            }
        },
        [activeTool, isCropping, cropStart, cropMode, isDrawingBlur, blurStart, getCanvasCoords, renderCanvas, freehandActive, freehandColor, freehandSize],
    );

    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            if (activeTool === 'crop' && isCropping) {
                setIsCropping(false);
                setCropStart(null);
                if (cropArea && cropArea.width > 5 && cropArea.height > 5) {
                    pushHistory(transform, cropArea);
                }
            } else if (activeTool === 'blur' && isDrawingBlur && blurStart) {
                const coords = getCanvasCoords(e);
                const region: BlurRegion = {
                    id: `blur-${Date.now()}`,
                    x: Math.min(blurStart.x, coords.x),
                    y: Math.min(blurStart.y, coords.y),
                    width: Math.abs(coords.x - blurStart.x),
                    height: Math.abs(coords.y - blurStart.y),
                    intensity: blurIntensity,
                };
                if (region.width > 5 && region.height > 5) {
                    setBlurRegions((prev) => [...prev, region]);
                    pushHistory(transform, cropArea);
                }
                setIsDrawingBlur(false);
                setBlurStart(null);
            } else if (activeTool === 'annotate' && freehandActive && freehandPointsRef.current.length > 0) {
                freehandPointsRef.current = [];
                const aCanvas = annotationCanvasRef.current;
                if (aCanvas) {
                    setAnnotationData(aCanvas.toDataURL());
                }
                pushHistory(transform, cropArea);
            }
        },
        [activeTool, isCropping, cropArea, isDrawingBlur, blurStart, getCanvasCoords, blurIntensity, transform, pushHistory, freehandActive],
    );

    const applyCrop = useCallback(() => {
        if (!cropArea || !canvasRef.current || !imageRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = cropArea.width;
        tempCanvas.height = cropArea.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        if (cropMode === 'circle') {
            tempCtx.beginPath();
            tempCtx.ellipse(
                cropArea.width / 2, cropArea.height / 2,
                cropArea.width / 2, cropArea.height / 2,
                0, 0, Math.PI * 2,
            );
            tempCtx.clip();
        }

        tempCtx.drawImage(
            canvas,
            cropArea.x, cropArea.y, cropArea.width, cropArea.height,
            0, 0, cropArea.width, cropArea.height,
        );

        const cropped = tempCanvas.toDataURL();
        const aCanvas = annotationCanvasRef.current;
        if (aCanvas) {
            const actx = aCanvas.getContext('2d');
            if (actx) actx.clearRect(0, 0, aCanvas.width, aCanvas.height);
        }
        setCropArea(null);
        setTransform({ ...defaultTransform });
        setBlurRegions([]);
        setAnnotationData(null);
        setBaseImage(cropped);
    }, [cropArea, cropMode]);

    const rotate = useCallback(
        (degrees: number) => {
            setTransform((prev) => {
                const next = { ...prev, rotation: (prev.rotation + degrees) % 360 };
                pushHistory(next, cropArea);
                return next;
            });
        },
        [pushHistory, cropArea],
    );

    const flipHorizontal = useCallback(() => {
        setTransform((prev) => {
            const next = { ...prev, flipH: !prev.flipH };
            pushHistory(next, cropArea);
            return next;
        });
    }, [pushHistory, cropArea]);

    const flipVertical = useCallback(() => {
        setTransform((prev) => {
            const next = { ...prev, flipV: !prev.flipV };
            pushHistory(next, cropArea);
            return next;
        });
    }, [pushHistory, cropArea]);

    const handleZoom = useCallback(
        (delta: number) => {
            setTransform((prev) => ({
                ...prev,
                zoom: Math.max(0.1, Math.min(5, prev.zoom + delta)),
            }));
        },
        [],
    );

    const handleSave = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !onSave) return;

        const mimeType = `image/${exportOpts.format === 'jpeg' ? 'jpeg' : exportOpts.format}`;
        let exportCanvas = canvas;

        if (exportOpts.maxWidth || exportOpts.maxHeight) {
            const maxW = exportOpts.maxWidth || Infinity;
            const maxH = exportOpts.maxHeight || Infinity;
            const scale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);

            if (scale < 1) {
                exportCanvas = document.createElement('canvas');
                exportCanvas.width = Math.round(canvas.width * scale);
                exportCanvas.height = Math.round(canvas.height * scale);
                const ctx = exportCanvas.getContext('2d');
                if (ctx) ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
            }
        }

        exportCanvas.toBlob(
            (blob) => {
                if (blob) onSave(blob, exportOpts.format);
            },
            mimeType,
            exportOpts.quality,
        );
    }, [onSave, exportOpts]);

    const resetAll = useCallback(() => {
        setTransform({ ...defaultTransform });
        setCropArea(null);
        setBlurRegions([]);
        setAnnotationData(null);
        const aCanvas = annotationCanvasRef.current;
        if (aCanvas) {
            const ctx = aCanvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, aCanvas.width, aCanvas.height);
        }
        if (baseImage !== src) setBaseImage(src);
    }, [baseImage, src]);

    const renderToolOptions = () => {
        switch (activeTool) {
            case 'crop':
                return (
                    <div className="eui-image-editor-tool-options">
                        <div className="eui-image-editor-option-group">
                            <span className="eui-image-editor-option-label">Aspect Ratio</span>
                            <div className="eui-image-editor-crop-modes">
                                {cropModes.map((mode) => (
                                    <button
                                        key={mode}
                                        className={cn('eui-image-editor-crop-mode-btn', { active: cropMode === mode })}
                                        onClick={() => setCropMode(mode)}
                                        type="button"
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {cropArea && cropArea.width > 5 && (
                            <button className="eui-image-editor-action-btn eui-image-editor-apply-btn" onClick={applyCrop} type="button">
                                Apply Crop
                            </button>
                        )}
                    </div>
                );

            case 'rotate':
                return (
                    <div className="eui-image-editor-tool-options">
                        <button className="eui-image-editor-action-btn" onClick={() => rotate(-90)} type="button">-90°</button>
                        <button className="eui-image-editor-action-btn" onClick={() => rotate(-45)} type="button">-45°</button>
                        <button className="eui-image-editor-action-btn" onClick={() => rotate(45)} type="button">+45°</button>
                        <button className="eui-image-editor-action-btn" onClick={() => rotate(90)} type="button">+90°</button>
                        <span className="eui-image-editor-option-value">{transform.rotation}°</span>
                    </div>
                );

            case 'flip':
                return (
                    <div className="eui-image-editor-tool-options">
                        <button
                            className={cn('eui-image-editor-action-btn', { active: transform.flipH })}
                            onClick={flipHorizontal}
                            type="button"
                        >
                            Horizontal
                        </button>
                        <button
                            className={cn('eui-image-editor-action-btn', { active: transform.flipV })}
                            onClick={flipVertical}
                            type="button"
                        >
                            Vertical
                        </button>
                    </div>
                );

            case 'blur':
                return (
                    <div className="eui-image-editor-tool-options">
                        <span className="eui-image-editor-option-label">Intensity</span>
                        <input
                            type="range"
                            min={2}
                            max={30}
                            value={blurIntensity}
                            onChange={(e) => setBlurIntensity(Number(e.target.value))}
                            className="eui-image-editor-range"
                        />
                        <span className="eui-image-editor-option-value">{blurIntensity}</span>
                        {blurRegions.length > 0 && (
                            <button
                                className="eui-image-editor-action-btn"
                                onClick={() => { setBlurRegions([]); pushHistory(transform, cropArea); }}
                                type="button"
                            >
                                Clear Blurs
                            </button>
                        )}
                    </div>
                );

            case 'annotate':
                return (
                    <div className="eui-image-editor-tool-options">
                        <button
                            className={cn('eui-image-editor-action-btn', { active: freehandActive })}
                            onClick={() => setFreehandActive(!freehandActive)}
                            type="button"
                        >
                            {freehandActive ? 'Drawing On' : 'Start Drawing'}
                        </button>
                        {freehandActive && (
                            <>
                                <input
                                    type="color"
                                    value={freehandColor}
                                    onChange={(e) => setFreehandColor(e.target.value)}
                                    className="eui-image-editor-color-input"
                                />
                                <input
                                    type="range"
                                    min={1}
                                    max={20}
                                    value={freehandSize}
                                    onChange={(e) => setFreehandSize(Number(e.target.value))}
                                    className="eui-image-editor-range"
                                />
                            </>
                        )}
                        {annotationData && (
                            <button
                                className="eui-image-editor-action-btn"
                                onClick={() => {
                                    setAnnotationData(null);
                                    const aCanvas = annotationCanvasRef.current;
                                    if (aCanvas) {
                                        const ctx = aCanvas.getContext('2d');
                                        if (ctx) ctx.clearRect(0, 0, aCanvas.width, aCanvas.height);
                                    }
                                }}
                                type="button"
                            >
                                Clear Annotations
                            </button>
                        )}
                    </div>
                );

            case 'transparency':
                return (
                    <div className="eui-image-editor-tool-options">
                        <span className="eui-image-editor-option-label">Opacity</span>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={Math.round(transform.transparency * 100)}
                            onChange={(e) => setTransform((prev) => ({ ...prev, transparency: Number(e.target.value) / 100 }))}
                            className="eui-image-editor-range"
                        />
                        <span className="eui-image-editor-option-value">{Math.round(transform.transparency * 100)}%</span>
                    </div>
                );

            case 'tilt':
                return (
                    <div className="eui-image-editor-tool-options">
                        <span className="eui-image-editor-option-label">Tilt</span>
                        <input
                            type="range"
                            min={-45}
                            max={45}
                            value={transform.tilt}
                            onChange={(e) => {
                                const tilt = Number(e.target.value);
                                setTransform((prev) => ({ ...prev, tilt }));
                            }}
                            className="eui-image-editor-range"
                        />
                        <span className="eui-image-editor-option-value">{transform.tilt}°</span>
                        <button
                            className="eui-image-editor-action-btn"
                            onClick={() => setTransform((prev) => ({ ...prev, tilt: 0 }))}
                            type="button"
                        >
                            Reset
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!loaded) {
        return (
            <div className={cn('eui-image-editor eui-image-editor-loading', className)} style={{ width, height }}>
                <div className="eui-image-editor-spinner" />
            </div>
        );
    }

    const handleToolbarKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'BUTTON') return;
        if (target.closest('select, input, textarea')) return;
        const focusable = Array.from(
            e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])'),
        );
        const idx = focusable.indexOf(target as HTMLButtonElement);
        if (idx < 0) return;
        let next = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % focusable.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + focusable.length) % focusable.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = focusable.length - 1;
        else return;
        e.preventDefault();
        focusable[next]?.focus();
    };

    return (
        <div className={cn('eui-image-editor', className)} style={{ width }}>
            <div
                className="eui-image-editor-toolbar"
                role="toolbar"
                aria-label="Image editor tools"
                onKeyDown={handleToolbarKey}
            >
                <div className="eui-image-editor-tools" role="group" aria-label="Tools">
                    {tools.map((tool) => (
                        <button
                            key={tool}
                            className={cn('eui-image-editor-tool-btn', { active: activeTool === tool })}
                            onClick={() => setActiveTool(tool)}
                            title={tool.charAt(0).toUpperCase() + tool.slice(1)}
                            aria-label={tool.charAt(0).toUpperCase() + tool.slice(1)}
                            aria-pressed={activeTool === tool}
                            type="button"
                        >
                            {toolIcons[tool]}
                            <span className="eui-image-editor-tool-label">{tool}</span>
                        </button>
                    ))}
                </div>

                <div className="eui-image-editor-actions">
                    <button
                        className="eui-image-editor-action-btn"
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        title="Undo"
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                    </button>
                    <button
                        className="eui-image-editor-action-btn"
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        title="Redo"
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.13-9.36L23 10" /></svg>
                    </button>

                    <div className="eui-image-editor-zoom-controls">
                        <button className="eui-image-editor-action-btn" onClick={() => handleZoom(-0.1)} title="Zoom Out" type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                        </button>
                        <span className="eui-image-editor-zoom-value">{Math.round(transform.zoom * 100)}%</span>
                        <button className="eui-image-editor-action-btn" onClick={() => handleZoom(0.1)} title="Zoom In" type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                        </button>
                    </div>

                    <button className="eui-image-editor-action-btn" onClick={resetAll} title="Reset" type="button">
                        Reset
                    </button>
                </div>
            </div>

            {renderToolOptions()}

            <div
                ref={containerRef}
                className="eui-image-editor-canvas-container"
                style={{ height }}
            >
                <canvas
                    ref={canvasRef}
                    className="eui-image-editor-canvas"
                    role="img"
                    aria-label={`Image editor canvas — active tool: ${activeTool}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
                <canvas
                    ref={annotationCanvasRef}
                    className="eui-image-editor-annotation-canvas"
                    width={imageRef.current?.naturalWidth || 800}
                    height={imageRef.current?.naturalHeight || 600}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="eui-image-editor-footer">
                {showExport ? (
                    <div className="eui-image-editor-export-options">
                        <select
                            value={exportOpts.format}
                            onChange={(e) => setExportOpts((prev) => ({ ...prev, format: e.target.value as ExportFormat }))}
                            className="eui-image-editor-select"
                        >
                            <option value="png">PNG</option>
                            <option value="jpeg">JPEG</option>
                            <option value="webp">WebP</option>
                        </select>
                        <div className="eui-image-editor-quality">
                            <span>Quality:</span>
                            <input
                                type="range"
                                min={10}
                                max={100}
                                value={Math.round(exportOpts.quality * 100)}
                                onChange={(e) => setExportOpts((prev) => ({ ...prev, quality: Number(e.target.value) / 100 }))}
                                className="eui-image-editor-range"
                            />
                            <span>{Math.round(exportOpts.quality * 100)}%</span>
                        </div>
                        <div className="eui-image-editor-size-opts">
                            <input
                                type="number"
                                placeholder="Max Width"
                                value={exportOpts.maxWidth || ''}
                                onChange={(e) => setExportOpts((prev) => ({ ...prev, maxWidth: Number(e.target.value) || undefined }))}
                                className="eui-image-editor-number-input"
                            />
                            <input
                                type="number"
                                placeholder="Max Height"
                                value={exportOpts.maxHeight || ''}
                                onChange={(e) => setExportOpts((prev) => ({ ...prev, maxHeight: Number(e.target.value) || undefined }))}
                                className="eui-image-editor-number-input"
                            />
                        </div>
                        <button className="eui-image-editor-save-btn" onClick={() => { handleSave(); setShowExport(false); }} type="button">
                            Export
                        </button>
                        <button className="eui-image-editor-cancel-btn" onClick={() => setShowExport(false)} type="button">
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="eui-image-editor-footer-actions">
                        {onCancel && (
                            <button className="eui-image-editor-cancel-btn" onClick={onCancel} type="button">
                                Cancel
                            </button>
                        )}
                        {onSave && (
                            <button className="eui-image-editor-save-btn" onClick={() => setShowExport(true)} type="button">
                                Save
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export { ImageEditor };
export type { ImageEditorProps, EditorState, EditorTool, CropMode, ExportFormat, ExportOptions, CropArea, ImageTransform, BlurRegion } from './image-editor-types';
