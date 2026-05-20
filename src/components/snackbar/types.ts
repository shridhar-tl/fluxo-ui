import { SVGIcon } from '../../assets/icons';
import { PlacementCorners } from '../../types';

export type SnackbarType = 'info' | 'success' | 'warning' | 'error';
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'bounce';
export type SnackbarPosition = PlacementCorners | 'topCenter' | 'bottomCenter';
export type SnackbarVariant =
    | 'soft'
    | 'solid'
    | 'outlined'
    | 'gradient'
    | 'accent'
    | 'glass'
    | 'minimal'
    | 'pill';
export type SnackbarSize = 'sm' | 'md' | 'lg';

export interface SnackbarItemProps {
    data: SnackbarData;
    onRemove: (id: number) => void;
}

export interface SnackbarOptions {
    type?: SnackbarType;
    timeout?: number;
    animation?: AnimationType;
    showCloseButton?: boolean;
    position?: SnackbarPosition;
    variant?: SnackbarVariant;
    size?: SnackbarSize;
    onClick?: () => void;
    onClose?: (manual: boolean) => void;
    customIcon?: SVGIcon;
}

export interface SnackbarData {
    id: number;
    message: string | React.ReactElement;
    title: string;
    options: Required<Omit<SnackbarOptions, 'onClick' | 'onClose' | 'customIcon'>> & {
        onClick?: () => void;
        onClose?: (manual: boolean) => void;
        customIcon?: SVGIcon;
    };
}
