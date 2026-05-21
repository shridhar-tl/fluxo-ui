import React from 'react';
import {
    FileArchiveIcon,
    FileAudioIcon,
    FileCodeIcon,
    FileIcon,
    FilePdfIcon,
    FileTextIcon,
    FileVideoIcon,
    FolderIcon,
    ImageIcon,
} from '../../assets/icons';
import type { FileKind } from './file-browser-utils';

const KIND_ICON: Record<FileKind, React.FC<React.SVGProps<SVGSVGElement>>> = {
    folder: FolderIcon,
    image: ImageIcon,
    video: FileVideoIcon,
    audio: FileAudioIcon,
    pdf: FilePdfIcon,
    document: FileTextIcon,
    text: FileTextIcon,
    code: FileCodeIcon,
    archive: FileArchiveIcon,
    file: FileIcon,
};

interface FileKindIconProps {
    kind: FileKind;
    size?: number;
    className?: string;
}

export const FileKindIcon: React.FC<FileKindIconProps> = ({ kind, size = 22, className }) => {
    const IconComponent = KIND_ICON[kind] ?? FileIcon;
    return <IconComponent width={size} height={size} className={className} aria-hidden="true" />;
};

FileKindIcon.displayName = 'FileKindIcon';
