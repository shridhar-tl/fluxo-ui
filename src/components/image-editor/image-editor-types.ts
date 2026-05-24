export type CropMode = 'custom' | 'square' | 'circle' | '16:9' | '4:3' | '3:2' | '1:1' | '9:16' | '3:4' | '2:3';
export type EditorTool = 'crop' | 'rotate' | 'flip' | 'blur' | 'annotate' | 'transparency' | 'tilt';

export interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageTransform {
    rotation: number;
    flipH: boolean;
    flipV: boolean;
    tilt: number;
    zoom: number;
    transparency: number;
}

export interface HistoryEntry {
    imageData: string;
    transform: ImageTransform;
    cropArea: CropArea | null;
}

export interface EditorState {
    baseImage: string;
    transform: ImageTransform;
    cropArea: CropArea | null;
    cropMode: CropMode;
    blurRegions: BlurRegion[];
    annotationData: string | null;
    flattened: string;
}

export interface BlurRegion {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    intensity: number;
}

export interface ImageEditorProps {
    src: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    tools?: EditorTool[];
    defaultTool?: EditorTool;
    maxHistory?: number;
    className?: string;
    cropModes?: CropMode[];
    editState?: EditorState | null;
    onEditStateChange?: (state: EditorState) => void;
}

export const aspectRatios: Record<string, number | null> = {
    custom: null,
    square: 1,
    circle: 1,
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '3:2': 3 / 2,
    '1:1': 1,
    '9:16': 9 / 16,
    '3:4': 3 / 4,
    '2:3': 2 / 3,
};
